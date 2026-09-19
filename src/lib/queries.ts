import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./auth";
import type {
  Application,
  Certification,
  Education,
  Experience,
  Job,
  Language,
  Profile,
  Resume,
  Skill,
} from "./types";

/** Acesso dinâmico por nome de tabela (usado pelos helpers genéricos). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as unknown as { from: (table: string) => any };

function tableQuery<T>(table: string, userId: string | undefined, order?: string) {
  return async (): Promise<T[]> => {
    if (!userId) return [];
    let builder = db.from(table).select("*").eq("user_id", userId);
    if (order) builder = builder.order(order, { ascending: true });
    const { data, error } = await builder;
    if (error) throw new Error(error.message);
    return (data ?? []) as T[];
  };
}


export function useProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["profile", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async (): Promise<Profile | null> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return (data ?? null) as Profile | null;
    },
  });
}

export function useExperiences() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["experiences", user?.id],
    enabled: Boolean(user?.id),
    queryFn: tableQuery<Experience>("experiences", user?.id, "sort_order"),
  });
}

export function useEducation() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["education", user?.id],
    enabled: Boolean(user?.id),
    queryFn: tableQuery<Education>("education", user?.id),
  });
}

export function useSkills() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["skills", user?.id],
    enabled: Boolean(user?.id),
    queryFn: tableQuery<Skill>("skills", user?.id),
  });
}

export function useLanguages() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["languages", user?.id],
    enabled: Boolean(user?.id),
    queryFn: tableQuery<Language>("languages", user?.id),
  });
}

export function useCertifications() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["certifications", user?.id],
    enabled: Boolean(user?.id),
    queryFn: tableQuery<Certification>("certifications", user?.id),
  });
}

export function useResumes() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["resumes", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async (): Promise<Resume[]> => {
      const { data, error } = await supabase
        .from("resumes")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []) as unknown as Resume[];
    },
  });
}

export function useResume(resumeId: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["resume", resumeId, user?.id],
    enabled: Boolean(user?.id && resumeId),
    queryFn: async (): Promise<Resume | null> => {
      const { data, error } = await supabase
        .from("resumes")
        .select("*")
        .eq("id", resumeId)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return (data ?? null) as unknown as Resume | null;
    },
  });
}

export function useApplications() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["applications", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async (): Promise<Application[]> => {
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []) as Application[];
    },
  });
}

export function useJobs() {
  return useQuery({
    queryKey: ["jobs"],
    queryFn: async (): Promise<Job[]> => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .order("published_at", { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []) as Job[];
    },
  });
}

export function useJob(jobId: string) {
  return useQuery({
    queryKey: ["job", jobId],
    enabled: Boolean(jobId),
    queryFn: async (): Promise<Job | null> => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", jobId)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return (data ?? null) as Job | null;
    },
  });
}

export function useProfileBundle() {
  const profile = useProfile();
  const experiences = useExperiences();
  const education = useEducation();
  const skills = useSkills();
  const languages = useLanguages();
  const certifications = useCertifications();

  return {
    profile: profile.data ?? null,
    experiences: experiences.data ?? [],
    education: education.data ?? [],
    skills: skills.data ?? [],
    languages: languages.data ?? [],
    certifications: certifications.data ?? [],
    isLoading:
      profile.isLoading ||
      experiences.isLoading ||
      education.isLoading ||
      skills.isLoading ||
      languages.isLoading ||
      certifications.isLoading,
  };
}

/** Mutação genérica para salvar/remover registros do usuário autenticado. */
export function useRowMutation(table: string, queryKey: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: [queryKey, user?.id] });
    queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
  };

  const insert = useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      const { error } = await supabase.from(table).insert({ ...values, user_id: user!.id });
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Record<string, unknown> }) => {
      const { error } = await supabase.from(table).update(values).eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
  });

  return { insert, update, remove };
}

export function useSaveProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: Partial<Profile>) => {
      const { error } = await supabase
        .from("profiles")
        .upsert({ id: user!.id, ...values })
        .eq("id", user!.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile", user?.id] }),
  });
}
