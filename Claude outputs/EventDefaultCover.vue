<!--
  EventDefaultCover.vue — DÜZELTİLMİŞ SÜRÜM

  Sorun: Mevcut bileşen sadece title, shortDescription, speakers, startDate
  prop'larını alıyor ve kapağa yalnızca "TARİH" yazıyor. Saat ve konum
  (address) hiç kullanılmadığı için konum seçilse bile kapakta çıkmıyor.

  Düzeltme:
   - Yeni prop'lar: address, locationType
   - TARİH satırına saat eklendi: "3 Ekim Cumartesi / 10:30"
   - YER sütunu eklendi (yüz yüze ise adres, online ise "Online")

  Bu bileşeni kullanan her yerde (etkinlik oluşturma/düzenleme formu,
  kapak PNG'sini üreten yer) yeni prop'ları da geçirin:

    <EventDefaultCover
      :title="event.title"
      :short-description="event.short_description"
      :speakers="event.speakers"
      :start-date="event.start_date"
      :address="event.address"
      :location-type="event.location_type"
    />

  Not: Bu dosya canlı sitedeki derlenmiş koddan yeniden oluşturuldu.
  Import yolları (logo, parseDate yardımcı fonksiyonu vb.) projedeki
  asıl dosyayla karşılaştırılıp uyarlanmalıdır.
-->
<script setup lang="ts">
import logoText from '~/assets/logo-text.svg'

interface Speaker {
  id: string
  name?: string
  display_name?: string
  avatar_url?: string
}

const props = defineProps<{
  title: string
  shortDescription?: string
  speakers?: Speaker[]
  startDate?: string
  address?: string | null
  locationType?: 'in_person' | 'online' | 'hybrid' | string | null
}>()

const { locale } = useI18n()
const isTr = computed(() => locale.value === 'tr')
const intlLocale = computed(() => (isTr.value ? 'tr-TR' : 'en-US'))

const dateLabel = computed<string | null>(() => {
  if (!props.startDate) return null
  const d = new Date(props.startDate)
  const day = d.toLocaleDateString(intlLocale.value, {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
    timeZone: 'Europe/Istanbul',
  })
  const time = d.toLocaleTimeString(intlLocale.value, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Europe/Istanbul',
  })
  return `${day} / ${time}`
})

const locationLabel = computed<string | null>(() => {
  if (props.locationType === 'online') return 'Online'
  if (!props.address) return null
  // "Hükümet Cd. No: 1 D:2-3-4-5, 06050 Altındağ, Türkiye"
  //   -> "Hükümet Cd. No: 1 D:2-3-4-5, Altındağ"
  return props.address
    .split(',')
    .map((p) => p.trim().replace(/^\d{5}\s*/, ''))
    .filter((p) => p && p !== 'Türkiye' && p !== 'Turkey')
    .join(', ')
})
</script>

<template>
  <div class="relative h-full w-full">
    <div
      class="relative flex h-full w-full flex-col overflow-hidden bg-[#F5F5F5] p-4 sm:p-6 lg:p-10"
    >
      <img
        :src="logoText"
        alt="Yazılımcı Buluşmaları"
        class="absolute top-4 right-4 z-10 h-4 w-auto select-none sm:top-6 sm:right-6 sm:h-5 lg:top-10 lg:right-10 lg:h-8"
      />

      <h2
        class="relative z-10 max-w-[65%] text-[24px] leading-[1.05] font-black text-[#1a1a1a] sm:text-[40px] lg:text-[64px]"
      >
        {{ title }}
      </h2>

      <p
        v-if="shortDescription"
        class="relative z-10 mt-2 line-clamp-3 max-w-[55%] text-[10px] leading-snug text-[#555] sm:mt-3 sm:text-[14px] lg:mt-4 lg:text-[18px]"
      >
        {{ shortDescription }}
      </p>

      <div class="flex-1" />

      <!-- TARİH + YER (önceki kahvaltı afişiyle aynı düzen) -->
      <div
        v-if="dateLabel || locationLabel"
        class="relative z-10 flex max-w-[70%] gap-4 sm:gap-8 lg:gap-12"
      >
        <div v-if="dateLabel">
          <div
            class="text-[9px] font-bold tracking-wider text-[#1a1a1a] uppercase sm:text-xs lg:text-[15px]"
          >
            {{ isTr ? 'TARİH' : 'DATE' }}
          </div>
          <div class="mt-0.5 text-[9px] text-[#333] sm:text-xs lg:text-[17px]">
            {{ dateLabel }}
          </div>
        </div>
        <div v-if="locationLabel">
          <div
            class="text-[9px] font-bold tracking-wider text-[#1a1a1a] uppercase sm:text-xs lg:text-[15px]"
          >
            {{ isTr ? 'YER' : 'LOCATION' }}
          </div>
          <div class="mt-0.5 text-[9px] text-[#333] sm:text-xs lg:text-[17px]">
            {{ locationLabel }}
          </div>
        </div>
      </div>

      <div
        v-if="speakers && speakers.length > 0"
        class="relative z-10 mt-2 flex flex-wrap gap-3 sm:mt-3 lg:mt-4 lg:gap-4"
      >
        <div
          v-for="s in speakers.slice(0, 3)"
          :key="s.id"
          class="flex items-center gap-1.5 sm:gap-2 lg:gap-3"
        >
          <img
            v-if="s.avatar_url"
            :src="s.avatar_url"
            :alt="s.display_name || s.name || ''"
            class="h-7 w-7 rounded-md object-cover sm:h-10 sm:w-10 lg:h-12 lg:w-12"
          />
          <div
            v-else
            class="bg-brand-200 text-brand-600 flex h-7 w-7 items-center justify-center rounded-md text-[10px] font-semibold sm:h-10 sm:w-10 sm:text-xs lg:h-12 lg:w-12 lg:text-sm"
          >
            {{ (s.display_name || s.name || '?')[0]?.toUpperCase() }}
          </div>
          <div class="text-[10px] font-bold text-[#1a1a1a] sm:text-xs lg:text-sm">
            {{ s.display_name || s.name }}
          </div>
        </div>
      </div>

      <img
        src="/cover-decoration.svg"
        alt=""
        aria-hidden="true"
        class="pointer-events-none absolute -right-6 bottom-[-10%] h-36 w-36 select-none sm:h-48 sm:w-48 lg:-right-4 lg:bottom-[-5%] lg:h-72 lg:w-72"
      />
    </div>
  </div>
</template>
