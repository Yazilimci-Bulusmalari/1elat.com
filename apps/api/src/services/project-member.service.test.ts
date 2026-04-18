import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  AlreadyMemberError,
  CannotInviteSelfError,
  DuplicateInvitationError,
  ForbiddenError,
  InvitationNotPendingError,
  NotFoundError,
  OwnerCannotLeaveError,
} from "../lib/errors";
import {
  acceptInvitation,
  cancelInvitation,
  createInvitation,
  declineInvitation,
  removeProjectMember,
} from "./project-member.service";

function makeDb(opts: {
  selectQueue: Array<unknown>;
  insertSpy?: ReturnType<typeof vi.fn>;
  updateSpy?: ReturnType<typeof vi.fn>;
  deleteSpy?: ReturnType<typeof vi.fn>;
}) {
  const queue = [...opts.selectQueue];
  const insertSpy = opts.insertSpy ?? vi.fn().mockResolvedValue(undefined);
  const updateSpy = opts.updateSpy ?? vi.fn().mockResolvedValue(undefined);
  const deleteSpy = opts.deleteSpy ?? vi.fn().mockResolvedValue(undefined);

  const chain: Record<string, unknown> = {};
  chain.from = () => chain;
  chain.where = () => chain;
  chain.innerJoin = () => chain;
  chain.orderBy = () => chain;
  chain.get = () => Promise.resolve(queue.shift());
  chain.all = () => Promise.resolve((queue.shift() as unknown[]) ?? []);

  return {
    db: {
      select: () => chain,
      insert: () => ({
        values: (v: unknown) => {
          insertSpy(v);
          return Promise.resolve(undefined);
        },
      }),
      update: () => ({
        set: (data: Record<string, unknown>) => {
          updateSpy(data);
          return { where: () => Promise.resolve(undefined) };
        },
      }),
      delete: () => ({
        where: () => {
          deleteSpy();
          return Promise.resolve(undefined);
        },
      }),
    },
    insertSpy,
    updateSpy,
    deleteSpy,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createInvitation", () => {
  it("happy path: invitation olusur", async () => {
    const created = {
      id: "inv1",
      projectId: "p1",
      inviterId: "owner",
      inviteeId: "u2",
      role: "dev",
      status: "pending",
      message: null,
      createdAt: new Date(),
      respondedAt: null,
    };
    const { db, insertSpy } = makeDb({
      selectQueue: [
        { id: "u2" }, // invitee lookup
        { ownerId: "owner" }, // project
        undefined, // existing member
        undefined, // existing pending
        created, // created select
      ],
    });
    const r = await createInvitation(db as never, "p1", "owner", "bob", "dev");
    expect(r.id).toBe("inv1");
    expect(insertSpy).toHaveBeenCalled();
  });

  it("invitee bulunamaz -> NotFoundError", async () => {
    const { db } = makeDb({ selectQueue: [undefined] });
    await expect(
      createInvitation(db as never, "p1", "owner", "ghost", "dev")
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("kendini davet -> CannotInviteSelfError", async () => {
    const { db } = makeDb({ selectQueue: [{ id: "owner" }] });
    await expect(
      createInvitation(db as never, "p1", "owner", "owner-username", "dev")
    ).rejects.toBeInstanceOf(CannotInviteSelfError);
  });

  it("invitee zaten owner -> AlreadyMemberError", async () => {
    const { db } = makeDb({
      selectQueue: [{ id: "u2" }, { ownerId: "u2" }],
    });
    await expect(
      createInvitation(db as never, "p1", "owner", "bob", "dev")
    ).rejects.toBeInstanceOf(AlreadyMemberError);
  });

  it("zaten member -> AlreadyMemberError", async () => {
    const { db } = makeDb({
      selectQueue: [
        { id: "u2" },
        { ownerId: "owner" },
        { id: "m1" }, // existing member
      ],
    });
    await expect(
      createInvitation(db as never, "p1", "owner", "bob", "dev")
    ).rejects.toBeInstanceOf(AlreadyMemberError);
  });

  it("aktif pending davet varsa -> DuplicateInvitationError", async () => {
    const { db } = makeDb({
      selectQueue: [
        { id: "u2" },
        { ownerId: "owner" },
        undefined,
        { id: "inv0" }, // pending exists
      ],
    });
    await expect(
      createInvitation(db as never, "p1", "owner", "bob", "dev")
    ).rejects.toBeInstanceOf(DuplicateInvitationError);
  });

  it("project yoksa -> NotFoundError", async () => {
    const { db } = makeDb({
      selectQueue: [{ id: "u2" }, undefined],
    });
    await expect(
      createInvitation(db as never, "p1", "owner", "bob", "dev")
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("acceptInvitation", () => {
  it("happy path: davet accepted, member eklendi", async () => {
    const inv = {
      id: "inv1",
      projectId: "p1",
      inviterId: "owner",
      inviteeId: "u2",
      role: "dev",
      status: "pending",
      message: null,
      createdAt: new Date(),
      respondedAt: null,
    };
    const { db, insertSpy, updateSpy } = makeDb({ selectQueue: [inv] });
    await acceptInvitation(db as never, "inv1", "u2");
    expect(updateSpy).toHaveBeenCalled();
    expect(insertSpy).toHaveBeenCalled();
  });

  it("baska kullanici -> 403", async () => {
    const inv = {
      id: "inv1",
      projectId: "p1",
      inviterId: "owner",
      inviteeId: "u2",
      role: "dev",
      status: "pending",
      message: null,
      createdAt: new Date(),
      respondedAt: null,
    };
    const { db } = makeDb({ selectQueue: [inv] });
    await expect(
      acceptInvitation(db as never, "inv1", "stranger")
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("zaten accepted -> InvitationNotPendingError", async () => {
    const inv = {
      id: "inv1",
      projectId: "p1",
      inviterId: "owner",
      inviteeId: "u2",
      role: "dev",
      status: "accepted",
      message: null,
      createdAt: new Date(),
      respondedAt: new Date(),
    };
    const { db } = makeDb({ selectQueue: [inv] });
    await expect(
      acceptInvitation(db as never, "inv1", "u2")
    ).rejects.toBeInstanceOf(InvitationNotPendingError);
  });

  it("yok -> 404", async () => {
    const { db } = makeDb({ selectQueue: [undefined] });
    await expect(
      acceptInvitation(db as never, "x", "u2")
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("declineInvitation", () => {
  it("happy path: declined", async () => {
    const inv = {
      id: "inv1",
      projectId: "p1",
      inviterId: "owner",
      inviteeId: "u2",
      role: "dev",
      status: "pending",
      message: null,
      createdAt: new Date(),
      respondedAt: null,
    };
    const { db, insertSpy, updateSpy } = makeDb({ selectQueue: [inv] });
    await declineInvitation(db as never, "inv1", "u2");
    expect(updateSpy).toHaveBeenCalled();
    expect(insertSpy).not.toHaveBeenCalled();
  });

  it("baska kullanici -> 403", async () => {
    const inv = {
      id: "inv1",
      projectId: "p1",
      inviterId: "owner",
      inviteeId: "u2",
      role: "dev",
      status: "pending",
      message: null,
      createdAt: new Date(),
      respondedAt: null,
    };
    const { db } = makeDb({ selectQueue: [inv] });
    await expect(
      declineInvitation(db as never, "inv1", "stranger")
    ).rejects.toBeInstanceOf(ForbiddenError);
  });
});

describe("cancelInvitation", () => {
  it("owner cancel -> OK", async () => {
    const row = {
      inv: {
        id: "inv1",
        projectId: "p1",
        inviterId: "owner",
        inviteeId: "u2",
        role: "dev",
        status: "pending",
        message: null,
        createdAt: new Date(),
        respondedAt: null,
      },
      ownerId: "owner",
    };
    const { db, updateSpy } = makeDb({ selectQueue: [row] });
    await cancelInvitation(db as never, "inv1", "owner", false);
    expect(updateSpy).toHaveBeenCalled();
  });

  it("baska kullanici cancel -> 403", async () => {
    const row = {
      inv: {
        id: "inv1",
        projectId: "p1",
        inviterId: "owner",
        inviteeId: "u2",
        role: "dev",
        status: "pending",
        message: null,
        createdAt: new Date(),
        respondedAt: null,
      },
      ownerId: "owner",
    };
    const { db } = makeDb({ selectQueue: [row] });
    await expect(
      cancelInvitation(db as never, "inv1", "stranger", false)
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("admin cancel -> OK", async () => {
    const row = {
      inv: {
        id: "inv1",
        projectId: "p1",
        inviterId: "owner",
        inviteeId: "u2",
        role: "dev",
        status: "pending",
        message: null,
        createdAt: new Date(),
        respondedAt: null,
      },
      ownerId: "owner",
    };
    const { db, updateSpy } = makeDb({ selectQueue: [row] });
    await cancelInvitation(db as never, "inv1", "admin-x", true);
    expect(updateSpy).toHaveBeenCalled();
  });

  it("zaten declined -> InvitationNotPendingError", async () => {
    const row = {
      inv: {
        id: "inv1",
        projectId: "p1",
        inviterId: "owner",
        inviteeId: "u2",
        role: "dev",
        status: "declined",
        message: null,
        createdAt: new Date(),
        respondedAt: new Date(),
      },
      ownerId: "owner",
    };
    const { db } = makeDb({ selectQueue: [row] });
    await expect(
      cancelInvitation(db as never, "inv1", "owner", false)
    ).rejects.toBeInstanceOf(InvitationNotPendingError);
  });
});

describe("removeProjectMember", () => {
  it("owner kendini cikaramaz -> OwnerCannotLeaveError", async () => {
    const { db } = makeDb({ selectQueue: [{ ownerId: "owner" }] });
    await expect(
      removeProjectMember(db as never, "p1", "owner", "owner", false)
    ).rejects.toBeInstanceOf(OwnerCannotLeaveError);
  });

  it("owner baska member'i cikarir -> OK", async () => {
    const { db, deleteSpy } = makeDb({
      selectQueue: [{ ownerId: "owner" }, { id: "m1" }],
    });
    await removeProjectMember(db as never, "p1", "u2", "owner", false);
    expect(deleteSpy).toHaveBeenCalled();
  });

  it("member kendini cikarir -> OK", async () => {
    const { db, deleteSpy } = makeDb({
      selectQueue: [{ ownerId: "owner" }, { id: "m1" }],
    });
    await removeProjectMember(db as never, "p1", "u2", "u2", false);
    expect(deleteSpy).toHaveBeenCalled();
  });

  it("baska kullanici baska member'i cikaramaz -> 403", async () => {
    const { db } = makeDb({ selectQueue: [{ ownerId: "owner" }] });
    await expect(
      removeProjectMember(db as never, "p1", "u2", "stranger", false)
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("admin baska member'i cikarabilir -> OK", async () => {
    const { db, deleteSpy } = makeDb({
      selectQueue: [{ ownerId: "owner" }, { id: "m1" }],
    });
    await removeProjectMember(db as never, "p1", "u2", "admin", true);
    expect(deleteSpy).toHaveBeenCalled();
  });

  it("project yok -> 404", async () => {
    const { db } = makeDb({ selectQueue: [undefined] });
    await expect(
      removeProjectMember(db as never, "p1", "u2", "owner", false)
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("member kaydi yok -> 404", async () => {
    const { db } = makeDb({
      selectQueue: [{ ownerId: "owner" }, undefined],
    });
    await expect(
      removeProjectMember(db as never, "p1", "u2", "owner", false)
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
