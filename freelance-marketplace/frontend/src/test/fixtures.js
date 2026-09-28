/**
 * Fixture factories for tests.
 */

export function makeUser(overrides = {}) {
  return {
    id: 1,
    username: "jane",
    email: "jane@example.com",
    first_name: "Jane",
    last_name: "Doe",
    role: "FREELANCER",
    profile_picture: null,
    bio: "",
    location: "",
    website: "",
    phone_number: "",
    is_active: true,
    freelancer_profile: null,
    employer_profile: null,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    ...overrides,
  };
}

export function makeFreelancer(overrides = {}) {
  return makeUser({
    role: "FREELANCER",
    freelancer_profile: {
      professional_title: "Django Developer",
      hourly_rate: "40.00",
      availability: "FULL_TIME",
      experience_years: 4,
      education: "",
      languages: "English",
      linkedin_url: "",
      github_url: "",
      twitter_url: "",
      is_featured: false,
      ...(overrides.freelancer_profile || {}),
    },
    ...overrides,
  });
}

export function makeEmployer(overrides = {}) {
  return makeUser({
    role: "EMPLOYER",
    username: "acme",
    first_name: "Acme",
    last_name: "HR",
    employer_profile: {
      company_name: "Acme Studios",
      company_logo: null,
      company_description: "",
      industry: "Software",
      company_size: "SMALL",
      company_website: "",
      contact_email: "",
      ...(overrides.employer_profile || {}),
    },
    ...overrides,
  });
}

export function makeJob(overrides = {}) {
  return {
    id: 1,
    title: "Build a Django REST API",
    slug: "build-a-django-rest-api",
    description: "A job description.",
    category: {
      id: 1,
      name: "Web Development",
      slug: "web-development",
      icon: "code",
    },
    skills: [
      { id: 1, name: "Django", slug: "django" },
      { id: 2, name: "React", slug: "react" },
    ],
    employer: makeEmployer(),
    budget_type: "FIXED_PRICE",
    min_budget: "800.00",
    max_budget: "800.00",
    experience_level: "INTERMEDIATE",
    location: "Remote",
    remote_status: "REMOTE",
    status: "OPEN",
    deadline: null,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    ...overrides,
  };
}

export function makeApplication(overrides = {}) {
  return {
    id: 1,
    job: 1,
    job_title: "Build a Django REST API",
    job_slug: "build-a-django-rest-api",
    freelancer: 1,
    freelancer_username: "jane",
    proposed_price: "750.00",
    estimated_duration: "2 weeks",
    status: "PENDING",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    decided_at: null,
    ...overrides,
  };
}

export function makeNotification(overrides = {}) {
  return {
    id: 1,
    notif_type: "NEW_APPLICATION",
    title: "New application received",
    message: "jane applied to 'Build a Django REST API'.",
    related_object_type: "application",
    related_object_id: 1,
    is_read: false,
    created_at: "2025-01-01T00:00:00Z",
    ...overrides,
  };
}