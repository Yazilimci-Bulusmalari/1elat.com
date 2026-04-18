// Seed data for lookup tables
// IDs are hardcoded 21-character nanoid-style strings

export function getSeedProfessions() {
  return [
    { id: "prof_frontend_dev_001", slug: "frontend-developer", nameEn: "Frontend Developer", nameTr: "Frontend Gelistirici", icon: "monitor", group: "engineering", sortOrder: 1, isActive: true },
    { id: "prof_backend_dev_0002", slug: "backend-developer", nameEn: "Backend Developer", nameTr: "Backend Gelistirici", icon: "server", group: "engineering", sortOrder: 2, isActive: true },
    { id: "prof_fullstack_dev_03", slug: "fullstack-developer", nameEn: "Full Stack Developer", nameTr: "Full Stack Gelistirici", icon: "layers", group: "engineering", sortOrder: 3, isActive: true },
    { id: "prof_mobile_dev_00004", slug: "mobile-developer", nameEn: "Mobile Developer", nameTr: "Mobil Gelistirici", icon: "smartphone", group: "engineering", sortOrder: 4, isActive: true },
    { id: "prof_devops_eng_00005", slug: "devops-engineer", nameEn: "DevOps Engineer", nameTr: "DevOps Muhendisi", icon: "container", group: "engineering", sortOrder: 5, isActive: true },
    { id: "prof_data_sci_000006", slug: "data-scientist", nameEn: "Data Scientist", nameTr: "Veri Bilimci", icon: "bar-chart-3", group: "data", sortOrder: 6, isActive: true },
    { id: "prof_ml_engineer_007", slug: "ml-engineer", nameEn: "ML Engineer", nameTr: "ML Muhendisi", icon: "brain", group: "data", sortOrder: 7, isActive: true },
    { id: "prof_ui_ux_design_08", slug: "ui-ux-designer", nameEn: "UI/UX Designer", nameTr: "UI/UX Tasarimci", icon: "palette", group: "design", sortOrder: 8, isActive: true },
    { id: "prof_product_mgr_009", slug: "product-manager", nameEn: "Product Manager", nameTr: "Urun Yoneticisi", icon: "briefcase", group: "management", sortOrder: 9, isActive: true },
    { id: "prof_qa_engineer_010", slug: "qa-engineer", nameEn: "QA Engineer", nameTr: "QA Muhendisi", icon: "shield-check", group: "engineering", sortOrder: 10, isActive: true },
    { id: "prof_security_eng_11", slug: "security-engineer", nameEn: "Security Engineer", nameTr: "Guvenlik Muhendisi", icon: "shield", group: "engineering", sortOrder: 11, isActive: true },
    { id: "prof_cloud_arch_0012", slug: "cloud-architect", nameEn: "Cloud Architect", nameTr: "Bulut Mimari", icon: "cloud", group: "engineering", sortOrder: 12, isActive: true },
    { id: "prof_game_dev_000013", slug: "game-developer", nameEn: "Game Developer", nameTr: "Oyun Gelistirici", icon: "gamepad-2", group: "engineering", sortOrder: 13, isActive: true },
    { id: "prof_embedded_dev_14", slug: "embedded-developer", nameEn: "Embedded Developer", nameTr: "Gomulu Sistem Gelistirici", icon: "cpu", group: "engineering", sortOrder: 14, isActive: true },
    { id: "prof_blockchain_d_15", slug: "blockchain-developer", nameEn: "Blockchain Developer", nameTr: "Blockchain Gelistirici", icon: "link", group: "engineering", sortOrder: 15, isActive: true },
  ];
}

export function getSeedCategories() {
  return [
    { id: "cat_dev_tools_0000001", slug: "developer-tools", nameEn: "Developer Tools", nameTr: "Gelistirici Araclari", icon: "wrench", description: null, sortOrder: 1, isActive: true },
    { id: "cat_web_app_00000002", slug: "web-application", nameEn: "Web Application", nameTr: "Web Uygulamasi", icon: "globe", description: null, sortOrder: 2, isActive: true },
    { id: "cat_mobile_app_00003", slug: "mobile-app", nameEn: "Mobile App", nameTr: "Mobil Uygulama", icon: "smartphone", description: null, sortOrder: 3, isActive: true },
    { id: "cat_ai_ml_0000000004", slug: "ai-ml", nameEn: "AI/ML", nameTr: "Yapay Zeka/ML", icon: "brain", description: null, sortOrder: 4, isActive: true },
    { id: "cat_ecommerce_000005", slug: "e-commerce", nameEn: "E-Commerce", nameTr: "E-Ticaret", icon: "shopping-cart", description: null, sortOrder: 5, isActive: true },
    { id: "cat_education_000006", slug: "education", nameEn: "Education", nameTr: "Egitim", icon: "graduation-cap", description: null, sortOrder: 6, isActive: true },
    { id: "cat_social_net_00007", slug: "social-network", nameEn: "Social Network", nameTr: "Sosyal Ag", icon: "users", description: null, sortOrder: 7, isActive: true },
    { id: "cat_productivity_008", slug: "productivity", nameEn: "Productivity", nameTr: "Verimlilik", icon: "zap", description: null, sortOrder: 8, isActive: true },
    { id: "cat_games_0000000009", slug: "games", nameEn: "Games", nameTr: "Oyunlar", icon: "gamepad-2", description: null, sortOrder: 9, isActive: true },
    { id: "cat_open_source_0010", slug: "open-source-library", nameEn: "Open Source Library", nameTr: "Acik Kaynak Kutuphane", icon: "book-open", description: null, sortOrder: 10, isActive: true },
  ];
}

export function getSeedProjectTypes() {
  return [
    { id: "type_web_app_0000001", slug: "web-app", nameEn: "Web Application", nameTr: "Web Uygulamasi", icon: "globe", sortOrder: 1, isActive: true },
    { id: "type_mobile_app_0002", slug: "mobile-app", nameEn: "Mobile App", nameTr: "Mobil Uygulama", icon: "smartphone", sortOrder: 2, isActive: true },
    { id: "type_desktop_app_003", slug: "desktop-app", nameEn: "Desktop App", nameTr: "Masaustu Uygulamasi", icon: "monitor", sortOrder: 3, isActive: true },
    { id: "type_api_backend_004", slug: "api-backend", nameEn: "API/Backend", nameTr: "API/Backend", icon: "server", sortOrder: 4, isActive: true },
    { id: "type_library_pkg_005", slug: "library-package", nameEn: "Library/Package", nameTr: "Kutuphane/Paket", icon: "package", sortOrder: 5, isActive: true },
    { id: "type_cli_tool_000006", slug: "cli-tool", nameEn: "CLI Tool", nameTr: "CLI Araci", icon: "terminal", sortOrder: 6, isActive: true },
    { id: "type_browser_ext_007", slug: "browser-extension", nameEn: "Browser Extension", nameTr: "Tarayici Eklentisi", icon: "puzzle", sortOrder: 7, isActive: true },
    { id: "type_hardware_iot_08", slug: "hardware-iot", nameEn: "Hardware/IoT", nameTr: "Donanim/IoT", icon: "cpu", sortOrder: 8, isActive: true },
  ];
}

export function getSeedProjectStages() {
  return [
    { id: "stage_idea_000000001", slug: "idea", nameEn: "Idea", nameTr: "Fikir", color: "yellow", sortOrder: 1, isActive: true },
    { id: "stage_prototype_0002", slug: "prototype", nameEn: "Prototype", nameTr: "Prototip", color: "orange", sortOrder: 2, isActive: true },
    { id: "stage_alpha_00000003", slug: "alpha", nameEn: "Alpha", nameTr: "Alfa", color: "blue", sortOrder: 3, isActive: true },
    { id: "stage_beta_000000004", slug: "beta", nameEn: "Beta", nameTr: "Beta", color: "indigo", sortOrder: 4, isActive: true },
    { id: "stage_production_005", slug: "production", nameEn: "Production", nameTr: "Uretim", color: "green", sortOrder: 5, isActive: true },
    { id: "stage_discontinued_6", slug: "discontinued", nameEn: "Discontinued", nameTr: "Durduruldu", color: "red", sortOrder: 6, isActive: true },
  ];
}

export function getSeedSkills() {
  return [
    { id: "skill_design_00000001", slug: "design", nameEn: "Design", nameTr: "Tasarım", icon: "palette", parentId: null, sortOrder: 1, isActive: true },
    { id: "skill_frontend_000002", slug: "frontend", nameEn: "Frontend", nameTr: "Frontend", icon: "monitor", parentId: null, sortOrder: 2, isActive: true },
    { id: "skill_backend_0000003", slug: "backend", nameEn: "Backend", nameTr: "Backend", icon: "server", parentId: null, sortOrder: 3, isActive: true },
    { id: "skill_fullstack_00004", slug: "fullstack", nameEn: "Fullstack", nameTr: "Fullstack", icon: "layers", parentId: null, sortOrder: 4, isActive: true },
    { id: "skill_mobile_0000005", slug: "mobile", nameEn: "Mobile", nameTr: "Mobil", icon: "smartphone", parentId: null, sortOrder: 5, isActive: true },
    { id: "skill_devops_0000006", slug: "devops", nameEn: "DevOps", nameTr: "DevOps", icon: "container", parentId: null, sortOrder: 6, isActive: true },
    { id: "skill_data_sci_00007", slug: "data-science", nameEn: "Data Science", nameTr: "Veri Bilimi", icon: "bar-chart-3", parentId: null, sortOrder: 7, isActive: true },
    { id: "skill_ai_ml_00000008", slug: "ai-ml", nameEn: "AI/ML", nameTr: "Yapay Zeka/ML", icon: "brain", parentId: null, sortOrder: 8, isActive: true },
    { id: "skill_qa_testing_009", slug: "qa-testing", nameEn: "QA/Testing", nameTr: "QA/Test", icon: "shield-check", parentId: null, sortOrder: 9, isActive: true },
    { id: "skill_product_mgmt10", slug: "product-management", nameEn: "Product Management", nameTr: "Ürün Yönetimi", icon: "briefcase", parentId: null, sortOrder: 10, isActive: true },
    { id: "skill_ui_ux_0000011", slug: "ui-ux", nameEn: "UI/UX", nameTr: "UI/UX", icon: "figma", parentId: null, sortOrder: 11, isActive: true },
    { id: "skill_blockchain_012", slug: "blockchain", nameEn: "Blockchain", nameTr: "Blockchain", icon: "link", parentId: null, sortOrder: 12, isActive: true },
    { id: "skill_game_dev_00013", slug: "game-dev", nameEn: "Game Development", nameTr: "Oyun Geliştirme", icon: "gamepad-2", parentId: null, sortOrder: 13, isActive: true },
    { id: "skill_security_00014", slug: "security", nameEn: "Security", nameTr: "Güvenlik", icon: "shield", parentId: null, sortOrder: 14, isActive: true },
    { id: "skill_cloud_0000015", slug: "cloud", nameEn: "Cloud", nameTr: "Bulut", icon: "cloud", parentId: null, sortOrder: 15, isActive: true },
  ];
}

export function getSeedTechnologies() {
  return [
    { id: "tech_react_000000001", slug: "react", name: "React", iconUrl: null, group: "framework", websiteUrl: "https://react.dev", sortOrder: 1, isActive: true },
    { id: "tech_vue_00000000002", slug: "vue", name: "Vue.js", iconUrl: null, group: "framework", websiteUrl: "https://vuejs.org", sortOrder: 2, isActive: true },
    { id: "tech_angular_0000003", slug: "angular", name: "Angular", iconUrl: null, group: "framework", websiteUrl: "https://angular.dev", sortOrder: 3, isActive: true },
    { id: "tech_nextjs_00000004", slug: "nextjs", name: "Next.js", iconUrl: null, group: "framework", websiteUrl: "https://nextjs.org", sortOrder: 4, isActive: true },
    { id: "tech_svelte_00000005", slug: "svelte", name: "Svelte", iconUrl: null, group: "framework", websiteUrl: "https://svelte.dev", sortOrder: 5, isActive: true },
    { id: "tech_nodejs_00000006", slug: "nodejs", name: "Node.js", iconUrl: null, group: "runtime", websiteUrl: "https://nodejs.org", sortOrder: 6, isActive: true },
    { id: "tech_python_00000007", slug: "python", name: "Python", iconUrl: null, group: "language", websiteUrl: "https://python.org", sortOrder: 7, isActive: true },
    { id: "tech_go_000000000008", slug: "go", name: "Go", iconUrl: null, group: "language", websiteUrl: "https://go.dev", sortOrder: 8, isActive: true },
    { id: "tech_rust_000000009", slug: "rust", name: "Rust", iconUrl: null, group: "language", websiteUrl: "https://rust-lang.org", sortOrder: 9, isActive: true },
    { id: "tech_java_000000010", slug: "java", name: "Java", iconUrl: null, group: "language", websiteUrl: "https://java.com", sortOrder: 10, isActive: true },
    { id: "tech_typescript_0011", slug: "typescript", name: "TypeScript", iconUrl: null, group: "language", websiteUrl: "https://typescriptlang.org", sortOrder: 11, isActive: true },
    { id: "tech_javascript_012", slug: "javascript", name: "JavaScript", iconUrl: null, group: "language", websiteUrl: "https://developer.mozilla.org/en-US/docs/Web/JavaScript", sortOrder: 12, isActive: true },
    { id: "tech_postgresql_013", slug: "postgresql", name: "PostgreSQL", iconUrl: null, group: "database", websiteUrl: "https://postgresql.org", sortOrder: 13, isActive: true },
    { id: "tech_mongodb_000014", slug: "mongodb", name: "MongoDB", iconUrl: null, group: "database", websiteUrl: "https://mongodb.com", sortOrder: 14, isActive: true },
    { id: "tech_redis_0000000015", slug: "redis", name: "Redis", iconUrl: null, group: "database", websiteUrl: "https://redis.io", sortOrder: 15, isActive: true },
    { id: "tech_docker_00000016", slug: "docker", name: "Docker", iconUrl: null, group: "tool", websiteUrl: "https://docker.com", sortOrder: 16, isActive: true },
    { id: "tech_kubernetes_0017", slug: "kubernetes", name: "Kubernetes", iconUrl: null, group: "tool", websiteUrl: "https://kubernetes.io", sortOrder: 17, isActive: true },
    { id: "tech_aws_00000000018", slug: "aws", name: "AWS", iconUrl: null, group: "cloud", websiteUrl: "https://aws.amazon.com", sortOrder: 18, isActive: true },
    { id: "tech_gcp_00000000019", slug: "gcp", name: "GCP", iconUrl: null, group: "cloud", websiteUrl: "https://cloud.google.com", sortOrder: 19, isActive: true },
    { id: "tech_azure_00000020", slug: "azure", name: "Azure", iconUrl: null, group: "cloud", websiteUrl: "https://azure.microsoft.com", sortOrder: 20, isActive: true },
    { id: "tech_tailwindcss_021", slug: "tailwindcss", name: "Tailwind CSS", iconUrl: null, group: "framework", websiteUrl: "https://tailwindcss.com", sortOrder: 21, isActive: true },
    { id: "tech_graphql_000022", slug: "graphql", name: "GraphQL", iconUrl: null, group: "tool", websiteUrl: "https://graphql.org", sortOrder: 22, isActive: true },
    { id: "tech_rest_0000000023", slug: "rest", name: "REST", iconUrl: null, group: "tool", websiteUrl: null, sortOrder: 23, isActive: true },
    { id: "tech_firebase_00024", slug: "firebase", name: "Firebase", iconUrl: null, group: "cloud", websiteUrl: "https://firebase.google.com", sortOrder: 24, isActive: true },
    { id: "tech_supabase_00025", slug: "supabase", name: "Supabase", iconUrl: null, group: "cloud", websiteUrl: "https://supabase.com", sortOrder: 25, isActive: true },
    { id: "tech_flutter_00026", slug: "flutter", name: "Flutter", iconUrl: null, group: "framework", websiteUrl: "https://flutter.dev", sortOrder: 26, isActive: true },
    { id: "tech_reactnative_27", slug: "react-native", name: "React Native", iconUrl: null, group: "framework", websiteUrl: "https://reactnative.dev", sortOrder: 27, isActive: true },
    { id: "tech_swift_0000000028", slug: "swift", name: "Swift", iconUrl: null, group: "language", websiteUrl: "https://swift.org", sortOrder: 28, isActive: true },
    { id: "tech_kotlin_00000029", slug: "kotlin", name: "Kotlin", iconUrl: null, group: "language", websiteUrl: "https://kotlinlang.org", sortOrder: 29, isActive: true },
    { id: "tech_csharp_00000030", slug: "csharp", name: "C#", iconUrl: null, group: "language", websiteUrl: "https://learn.microsoft.com/en-us/dotnet/csharp/", sortOrder: 30, isActive: true },
  ];
}
