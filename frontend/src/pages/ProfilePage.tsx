import { useEffect, useState, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router'

import { AppHeader } from '../components/layout/AppHeader'
import { Button } from '../components/ui/Button'
import { DecorativeDisc } from '../components/ui/DecorativeDisc'
import { Input } from '../components/ui/Input'
import { PageHeader } from '../components/ui/PageHeader'
import { Tag } from '../components/ui/Tag'
import { ApiError } from '../shared/api/apiClient'
import { refreshAccessToken } from '../shared/api/authApi'
import {
  getMusicPassport,
  type MusicPassport,
} from '../shared/api/musicPassportApi'
import {
  getMyProfile,
  updateMyProfile,
  uploadMyAvatar,
  type MyProfile,
} from '../shared/api/profileApi'
import { getCurrentUser, type CurrentUser } from '../shared/api/userApi'
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveAccessToken,
} from '../shared/api/tokenStorage'

type ProfileForm = {
  displayName: string
  city: string
  birthDate: string
  bio: string
}

function createFormFromProfile(profile: MyProfile): ProfileForm {
  return {
    displayName: profile.display_name || 'Пользователь',
    city: profile.city || '',
    birthDate: profile.birth_date || '',
    bio:
      profile.bio ||
      'Расскажи немного о себе, любимой музыке и концертах, на которые хочешь сходить.',
  }
}

export function ProfilePage() {
  const navigate = useNavigate()

  const [user, setUser] = useState<CurrentUser | null>(null)
  const [profileForm, setProfileForm] = useState<ProfileForm | null>(null)
  const [savedProfileForm, setSavedProfileForm] = useState<ProfileForm | null>(
    null,
  )
  const [musicPassport, setMusicPassport] = useState<MusicPassport | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [isMusicPassportLoading, setIsMusicPassportLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [musicPassportError, setMusicPassportError] = useState('')

  async function loadUserAndProfileWithToken(token: string) {
    const currentUser = await getCurrentUser(token)
    const currentProfile = await getMyProfile(token)
    const initialForm = createFormFromProfile(currentProfile)

    setUser({
      ...currentUser,
      profile: {
        ...currentUser.profile,
        display_name: currentProfile.display_name,
        birth_date: currentProfile.birth_date,
        bio: currentProfile.bio,
        avatar_url: currentProfile.avatar_url ?? currentUser.profile.avatar_url,
        preview_track_url:
          currentProfile.preview_track_url ??
          currentUser.profile.preview_track_url ??
          '',
        updated_at:
          currentProfile.updated_at ?? currentUser.profile.updated_at ?? '',
      },
    })

    setProfileForm(initialForm)
    setSavedProfileForm(initialForm)

    try {
      setIsMusicPassportLoading(true)
      setMusicPassportError('')

      const passport = await getMusicPassport(token)

      setMusicPassport(passport)
    } catch {
      setMusicPassport(null)
      setMusicPassportError('Не удалось загрузить музыкальные предпочтения.')
    } finally {
      setIsMusicPassportLoading(false)
    }
  }

  useEffect(() => {
    async function loadProfile() {
      const accessToken = getAccessToken()

      if (!accessToken) {
        navigate('/login')
        return
      }

      try {
        await loadUserAndProfileWithToken(accessToken)
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          const refreshToken = getRefreshToken()

          if (!refreshToken) {
            clearTokens()
            navigate('/login')
            return
          }

          try {
            const newTokens = await refreshAccessToken(refreshToken)

            saveAccessToken(newTokens.access)

            await loadUserAndProfileWithToken(newTokens.access)
          } catch {
            clearTokens()
            navigate('/login')
          }

          return
        }

        setError('Не удалось загрузить профиль. Попробуй обновить страницу.')
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [navigate])

  function handleChange(field: keyof ProfileForm, value: string) {
    setSuccessMessage('')
    setError('')

    setProfileForm((currentForm) => {
      if (!currentForm) {
        return currentForm
      }

      return {
        ...currentForm,
        [field]: value,
      }
    })
  }

  function handleStartEditing() {
    setSuccessMessage('')
    setError('')
    setIsEditing(true)
  }

  function handleCancelEditing() {
    setProfileForm(savedProfileForm)
    setSuccessMessage('')
    setError('')
    setIsEditing(false)
  }

  function updateUserProfile(updatedProfile: MyProfile) {
    setUser((currentUser) => {
      if (!currentUser) {
        return currentUser
      }

      return {
        ...currentUser,
        profile: {
          ...currentUser.profile,
          display_name: updatedProfile.display_name,
          birth_date: updatedProfile.birth_date,
          bio: updatedProfile.bio,
          avatar_url: updatedProfile.avatar_url ?? currentUser.profile.avatar_url,
          preview_track_url:
            updatedProfile.preview_track_url ??
            currentUser.profile.preview_track_url ??
            '',
          updated_at:
            updatedProfile.updated_at ?? currentUser.profile.updated_at ?? '',
        },
      }
    })
  }

  async function saveProfileWithToken(token: string, form: ProfileForm) {
    return updateMyProfile(token, {
      display_name: form.displayName.trim(),
      birth_date: form.birthDate || null,
      city: form.city.trim(),
      bio: form.bio.trim(),
    })
  }

  async function uploadAvatarWithToken(token: string, file: File) {
    return uploadMyAvatar(token, file)
  }

  async function handleSaveProfile() {
    if (!profileForm) {
      return
    }

    if (!profileForm.displayName.trim()) {
      setSuccessMessage('')
      setError('Имя не может быть пустым.')
      return
    }

    const accessToken = getAccessToken()

    if (!accessToken) {
      clearTokens()
      navigate('/login')
      return
    }

    try {
      setIsSaving(true)
      setError('')
      setSuccessMessage('')

      const updatedProfile = await saveProfileWithToken(accessToken, profileForm)
      const updatedForm = createFormFromProfile(updatedProfile)

      updateUserProfile(updatedProfile)
      setProfileForm(updatedForm)
      setSavedProfileForm(updatedForm)
      setIsEditing(false)
      setSuccessMessage('Изменения профиля сохранены.')
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        const refreshToken = getRefreshToken()

        if (!refreshToken) {
          clearTokens()
          navigate('/login')
          return
        }

        try {
          const newTokens = await refreshAccessToken(refreshToken)

          saveAccessToken(newTokens.access)

          const updatedProfile = await saveProfileWithToken(
            newTokens.access,
            profileForm,
          )
          const updatedForm = createFormFromProfile(updatedProfile)

          updateUserProfile(updatedProfile)
          setProfileForm(updatedForm)
          setSavedProfileForm(updatedForm)
          setIsEditing(false)
          setSuccessMessage('Изменения профиля сохранены.')
        } catch {
          setError('Не удалось сохранить профиль. Попробуй ещё раз.')
        }

        return
      }

      setError('Не удалось сохранить профиль. Попробуй ещё раз.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    event.target.value = ''

    if (!file) {
      return
    }

    if (!file.type.startsWith('image/')) {
      setSuccessMessage('')
      setError('Можно загрузить только изображение.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setSuccessMessage('')
      setError('Размер изображения не должен превышать 5 МБ.')
      return
    }

    const accessToken = getAccessToken()

    if (!accessToken) {
      clearTokens()
      navigate('/login')
      return
    }

    try {
      setIsUploadingAvatar(true)
      setError('')
      setSuccessMessage('')

      const updatedProfile = await uploadAvatarWithToken(accessToken, file)
      const updatedForm = createFormFromProfile(updatedProfile)

      updateUserProfile(updatedProfile)
      setProfileForm(updatedForm)
      setSavedProfileForm(updatedForm)
      setSuccessMessage('Фото профиля загружено.')
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        const refreshToken = getRefreshToken()

        if (!refreshToken) {
          clearTokens()
          navigate('/login')
          return
        }

        try {
          const newTokens = await refreshAccessToken(refreshToken)

          saveAccessToken(newTokens.access)

          const updatedProfile = await uploadAvatarWithToken(
            newTokens.access,
            file,
          )
          const updatedForm = createFormFromProfile(updatedProfile)

          updateUserProfile(updatedProfile)
          setProfileForm(updatedForm)
          setSavedProfileForm(updatedForm)
          setSuccessMessage('Фото профиля загружено.')
        } catch {
          setError('Не удалось загрузить фото. Попробуй другое изображение.')
        }

        return
      }

      setError('Не удалось загрузить фото. Попробуй другое изображение.')
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#f8f0ff]">
        <AppHeader activePage="profile" />

        <section className="flex min-h-[calc(100vh-96px)] items-center justify-center px-6">
          <p className="rounded-3xl border border-white/30 bg-white/70 px-8 py-5 font-semibold text-[#100516] shadow-xl backdrop-blur">
            Загружаем профиль...
          </p>
        </section>
      </main>
    )
  }

  if (error && !profileForm) {
    return (
      <main className="min-h-screen bg-[#f8f0ff]">
        <AppHeader activePage="profile" />

        <section className="flex min-h-[calc(100vh-96px)] items-center justify-center px-6">
          <p className="rounded-3xl bg-red-500/20 px-8 py-5 font-semibold text-red-700">
            {error}
          </p>
        </section>
      </main>
    )
  }

  if (!user || !profileForm) {
    return null
  }

  const avatarLetter = profileForm.displayName[0]?.toUpperCase() || 'S'
  const genres = musicPassport?.genres ?? []
  const artists = musicPassport?.artists ?? []
  const tracks = musicPassport?.top_tracks ?? []

  return (
    <main className="min-h-screen bg-[#f8f0ff]">
      <AppHeader activePage="profile" />

      <section className="relative overflow-hidden px-6 py-10">
        <DecorativeDisc position="right" opacity="0.10" />

        <div className="pointer-events-none absolute -right-16 top-28 hidden h-[520px] w-[520px] rounded-full bg-[#d923ff]/10 blur-3xl lg:block" />

        <div className="pointer-events-none absolute left-0 top-52 h-44 w-full bg-[linear-gradient(90deg,transparent,rgba(217,35,255,0.14),transparent)] blur-2xl" />

        <div className="relative z-10 mx-auto max-w-6xl">
          <PageHeader
            label="Мой профиль"
            title="Настрой, как тебя увидят другие"
            description="Добавь фото, расскажи о себе и покажи, какая музыка тебе близка."
          />

          {successMessage && (
            <p className="mb-6 inline-flex rounded-2xl border border-green-300 bg-green-100 px-5 py-3 text-sm font-semibold text-green-800">
              {successMessage}
            </p>
          )}

          {error && profileForm && (
            <p className="mb-6 inline-flex rounded-2xl border border-red-300 bg-red-100 px-5 py-3 text-sm font-semibold text-red-800">
              {error}
            </p>
          )}

          <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
            <aside className="relative rounded-[34px] border border-white/60 bg-white/70 p-6 shadow-[0_25px_80px_rgba(80,0,120,0.16)] backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-bold text-[#100516]">
                  Фото профиля
                </p>

                <span className="rounded-full bg-[#f4d8ff] px-3 py-1 text-xs font-bold text-[#9c20c7]">
                  Аватар
                </span>
              </div>

              <div className="relative overflow-hidden rounded-[30px] border border-[#d923ff]/60 bg-gradient-to-br from-[#120617] via-[#3b0b4d] to-[#d923ff] p-4 shadow-[0_0_35px_rgba(217,35,255,0.18)]">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#f13bff]/40 blur-2xl" />

                <div className="relative flex h-72 items-center justify-center overflow-hidden rounded-[24px] bg-black/35">
                  {user.profile.avatar_url ? (
                    <img
                      className="h-full w-full object-cover"
                      src={user.profile.avatar_url}
                      alt="Аватар пользователя"
                    />
                  ) : (
                    <div className="text-center">
                      <span className="block text-8xl font-black text-[#f13bff]">
                        {avatarLetter}
                      </span>

                      <span className="mt-3 block text-sm font-semibold text-[#e8c8f3]">
                        фото пока не добавлено
                      </span>
                    </div>
                  )}
                </div>

                <div className="relative mt-4 flex justify-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-white" />
                  <span className="h-2 w-2 rounded-full bg-white/45" />
                  <span className="h-2 w-2 rounded-full bg-white/45" />
                  <span className="h-2 w-2 rounded-full bg-white/45" />
                </div>
              </div>

              <label
                className={`mt-5 flex w-full items-center justify-center rounded-full bg-[#100516] px-5 py-3 text-sm font-bold text-white shadow-lg transition ${
                  isUploadingAvatar
                    ? 'cursor-not-allowed opacity-60'
                    : 'cursor-pointer hover:-translate-y-0.5 hover:bg-[#271036]'
                }`}
              >
                {isUploadingAvatar ? 'Загрузка фото...' : 'Загрузить фото'}

                <input
                  className="hidden"
                  type="file"
                  accept="image/*"
                  disabled={isUploadingAvatar}
                  onChange={handleAvatarChange}
                />
              </label>

              <p className="mt-3 text-center text-xs text-gray-500">
                Поддерживаются изображения до 5 МБ.
              </p>

              <div className="mt-6">
                <h2 className="text-3xl font-black text-[#100516]">
                  {profileForm.displayName || 'Пользователь'}
                </h2>

                <p className="mt-1 text-sm text-gray-600">{user.email}</p>
              </div>

              <div className="mt-6 space-y-3">
                <div className="rounded-2xl bg-[#f8f0ff]/90 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#9c20c7]">
                    Город
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#100516]">
                    {profileForm.city || 'Не указан'}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#f8f0ff]/90 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#9c20c7]">
                    Дата регистрации
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#100516]">
                    {new Date(user.created_at).toLocaleDateString('ru-RU')}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#f8f0ff]/90 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#9c20c7]">
                    Статус
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#100516]">
                    {isEditing ? 'Редактирование анкеты' : 'Анкета активна'}
                  </p>
                </div>
              </div>
            </aside>

            <div className="space-y-8">
              <section className="rounded-[34px] border border-white/60 bg-white/75 p-8 shadow-[0_25px_80px_rgba(80,0,120,0.14)] backdrop-blur-xl">
                <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
                  <div>
                    <h2 className="text-2xl font-black text-[#100516]">
                      Основная информация
                    </h2>

                    <p className="mt-2 text-sm text-gray-600">
                      Эти данные помогают другим пользователям лучше понять,
                      кто ты и что тебе интересно.
                    </p>
                  </div>

                  <span className="rounded-full bg-[#100516] px-4 py-2 text-xs font-bold text-white">
                    {isEditing ? 'Редактирование' : 'Только просмотр'}
                  </span>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <Input
                    label="Имя"
                    value={profileForm.displayName}
                    readOnly={!isEditing}
                    onChange={(event) =>
                      handleChange('displayName', event.target.value)
                    }
                  />

                  <Input
                    label="Город"
                    value={profileForm.city}
                    readOnly={!isEditing}
                    placeholder="Например, Минск"
                    onChange={(event) =>
                      handleChange('city', event.target.value)
                    }
                  />

                  <Input
                    label="Дата рождения"
                    type="date"
                    value={profileForm.birthDate}
                    readOnly={!isEditing}
                    onChange={(event) =>
                      handleChange('birthDate', event.target.value)
                    }
                  />

                  <Input label="Email" value={user.email} readOnly />
                </div>

                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      className="block text-sm font-bold text-[#100516]"
                      htmlFor="profile-bio"
                    >
                      О себе
                    </label>

                    <span className="text-xs font-semibold text-gray-500">
                      {profileForm.bio.length}/500
                    </span>
                  </div>

                  <textarea
                    className="min-h-36 w-full resize-none rounded-2xl border border-[#d923ff]/45 bg-white/80 px-4 py-3 text-sm leading-6 text-[#100516] outline-none transition focus:border-[#d923ff] focus:ring-4 focus:ring-[#d923ff]/20 read-only:focus:ring-0"
                    id="profile-bio"
                    value={profileForm.bio}
                    readOnly={!isEditing}
                    maxLength={500}
                    onChange={(event) =>
                      handleChange('bio', event.target.value)
                    }
                  />
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  {isEditing ? (
                    <>
                      <Button
                        type="button"
                        disabled={isSaving}
                        onClick={handleSaveProfile}
                      >
                        {isSaving ? 'Сохранение...' : 'Сохранить'}
                      </Button>

                      <Button
                        type="button"
                        variant="light"
                        disabled={isSaving}
                        onClick={handleCancelEditing}
                      >
                        Отменить
                      </Button>
                    </>
                  ) : (
                    <Button type="button" onClick={handleStartEditing}>
                      Редактировать профиль
                    </Button>
                  )}
                </div>
              </section>

              <section className="rounded-[34px] border border-white/60 bg-white/75 p-8 shadow-[0_25px_80px_rgba(80,0,120,0.14)] backdrop-blur-xl">
                <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
                  <div>
                    <h2 className="text-2xl font-black text-[#100516]">
                      Мой музыкальный вкус
                    </h2>

                    <p className="mt-2 text-sm text-gray-600">
                      Жанры, любимые исполнители и треки, которые лучше всего
                      отражают твой музыкальный вкус.
                    </p>
                  </div>

                  <Button type="button" disabled>
                    Моя музыка
                  </Button>
                </div>

                {musicPassportError && (
                  <p className="mb-5 rounded-2xl border border-red-300 bg-red-100 px-5 py-3 text-sm font-semibold text-red-800">
                    {musicPassportError}
                  </p>
                )}

                {isMusicPassportLoading ? (
                  <div className="rounded-3xl bg-[#f8f0ff]/90 p-5 text-sm font-semibold text-[#100516]">
                    Загружаем музыкальные предпочтения...
                  </div>
                ) : (
                  <div className="grid gap-6 xl:grid-cols-3">
                    <div className="rounded-3xl bg-[#f8f0ff]/90 p-5">
                      <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-[#9c20c7]">
                        Любимые жанры
                      </h3>

                      <div className="flex flex-wrap gap-3">
                        {genres.length > 0 ? (
                          genres.map((genre) => (
                            <Tag key={genre} variant="genre">
                              {genre}
                            </Tag>
                          ))
                        ) : (
                          <span className="text-sm font-semibold text-gray-500">
                            Жанры пока не найдены
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="rounded-3xl bg-[#f8f0ff]/90 p-5">
                      <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-[#9c20c7]">
                        Любимые исполнители
                      </h3>

                      <div className="flex flex-wrap gap-3">
                        {artists.length > 0 ? (
                          artists.map((artist) => (
                            <Tag
                              key={`${artist.name}-${artist.source}`}
                              variant="artist"
                            >
                              {artist.name}
                            </Tag>
                          ))
                        ) : (
                          <span className="text-sm font-semibold text-gray-500">
                            Исполнители пока не найдены
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="rounded-3xl bg-[#08050d] p-5 text-white">
                      <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-[#f13bff]">
                        Топ-треки
                      </h3>

                      <div className="space-y-3">
                        {tracks.length > 0 ? (
                          tracks.slice(0, 4).map((track) => (
                            <div
                              className="rounded-2xl bg-white/10 px-4 py-3"
                              key={`${track.artist}-${track.title}`}
                            >
                              <p className="text-sm font-bold">
                                {track.title}
                              </p>

                              <p className="mt-1 text-xs text-white/60">
                                {track.artist}
                              </p>

                              {track.url && (
                                <a
                                  className="mt-2 inline-flex text-xs font-bold text-[#f13bff] hover:underline"
                                  href={track.url}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  Открыть трек
                                </a>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-white/60">
                            Треки пока не найдены
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </section>

              <section className="overflow-hidden rounded-[34px] border border-[#d923ff]/40 bg-[#08050d] p-8 text-white shadow-[0_25px_80px_rgba(80,0,120,0.18)]">
                <div className="grid gap-6 md:grid-cols-[1fr_220px] md:items-center">
                  <div>
                    <p className="mb-2 text-sm font-bold uppercase tracking-[0.25em] text-[#f13bff]">
                      Как выглядит анкета
                    </p>

                    <h2 className="text-2xl font-black">
                      Так тебя увидят другие
                    </h2>

                    <p className="mt-3 max-w-xl text-sm leading-6 text-white/70">
                      В ленте будет отображаться короткая карточка: имя, город,
                      фото, описание и музыкальные совпадения.
                    </p>
                  </div>

                  <div className="rounded-[28px] border border-white/10 bg-white/10 p-4">
                    <div className="mb-4 flex h-32 items-center justify-center overflow-hidden rounded-2xl bg-black/40 text-5xl font-black text-[#f13bff]">
                      {user.profile.avatar_url ? (
                        <img
                          className="h-full w-full object-cover"
                          src={user.profile.avatar_url}
                          alt="Миниатюра аватара"
                        />
                      ) : (
                        avatarLetter
                      )}
                    </div>

                    <h3 className="text-xl font-black">
                      {profileForm.displayName || 'Пользователь'}
                    </h3>

                    <p className="mt-1 text-xs text-[#e8c8f3]">
                      {profileForm.city || 'Город не указан'}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Tag variant="dark">87% совпадение</Tag>

                      <Tag variant="dark">{genres[0] || 'Музыка'}</Tag>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

