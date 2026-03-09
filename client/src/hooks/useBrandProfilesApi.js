import { useAuth } from '@clerk/react';

const BASE_URL = import.meta.env.VITE_SOFTWARE_API_URL || 'http://localhost:3001';

export function useBrandProfilesApi() {
  const { getToken } = useAuth();

  async function apiFetch(path, options = {}) {
    const token = await getToken();
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(body || `Request failed: ${res.status}`);
    }
    return res.json();
  }

  return {
    listProfiles:   ()           => apiFetch('/api/brand-profiles'),
    getProfile:     (slug)       => apiFetch(`/api/brand-profiles/${slug}`),
    createProfile:  (data)       => apiFetch('/api/brand-profiles',        { method: 'POST',   body: JSON.stringify(data) }),
    updateProfile:  (slug, data) => apiFetch(`/api/brand-profiles/${slug}`, { method: 'PUT',    body: JSON.stringify(data) }),
    deleteProfile:  (slug)       => apiFetch(`/api/brand-profiles/${slug}`, { method: 'DELETE' }),
    seedProfile:    ()           => apiFetch('/api/brand-profiles/seed',    { method: 'POST' }),
    scanWebsite:    (urls, signal) => apiFetch('/api/brand-profile-agent/scan', { method: 'POST', body: JSON.stringify({ urls }), signal }),
    generateBlog:   (data, signal) => apiFetch('/api/xeo-blog-agent/generate',  { method: 'POST', body: JSON.stringify(data), signal }),
    generateTopics:     (data, signal) => apiFetch('/api/xeo-blog-agent/generate-topics',  { method: 'POST', body: JSON.stringify(data), signal }),
    generatePillarBlog: (data, signal) => apiFetch('/api/xeo-blog-agent/generate-pillar', { method: 'POST', body: JSON.stringify(data), signal }),

    // XEO blog topics CRUD
    listTopics:     (profileId, themeId) => apiFetch(`/api/xeo-blogs/topics?profileId=${profileId}&themeId=${themeId}`),
    createTopics:   (topics)             => apiFetch('/api/xeo-blogs/topics', { method: 'POST', body: JSON.stringify({ topics }) }),
    deleteTopic:    (id)                 => apiFetch(`/api/xeo-blogs/topics/${id}`, { method: 'DELETE' }),
    updateTopic:    (id, data)           => apiFetch(`/api/xeo-blogs/topics/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

    // XEO blogs CRUD
    listBlogs:      ()                   => apiFetch('/api/xeo-blogs'),
    getBlog:        (slug)               => apiFetch(`/api/xeo-blogs/${slug}`),
    createBlog:     (data)               => apiFetch('/api/xeo-blogs', { method: 'POST', body: JSON.stringify(data) }),
    deleteBlog:     (slug)               => apiFetch(`/api/xeo-blogs/${slug}`, { method: 'DELETE' }),
  };
}
