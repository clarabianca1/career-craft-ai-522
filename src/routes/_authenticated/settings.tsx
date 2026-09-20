import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useProfile, useSaveProfile } from "@/lib/queries";
import { SENIORITY_OPTIONS, WORK_MODEL_OPTIONS } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Configurações — MatchCV" },
      {
        name: "description",
        content: "Gerencie conta, preferências profissionais, preferências de vagas, privacidade e notificações.",
      },
      { property: "og:title", content: "Configurações — MatchCV" },
      { property: "og:description", content: "Conta, preferências e privacidade no MatchCV." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const saveProfile = useSaveProfile();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [preferences, setPreferences] = useState({
    target_role: "",
    seniority: "",
    work_model: "",
    desired_location: "",
    salary_expectation: "",
  });
  const [notifications, setNotifications] = useState({ matches: true, weekly: false });

  return (
    <AppShell
      title="Configurações"
      breadcrumb={[{ label: "Dashboard", to: "/dashboard" }, { label: "Configurações" }]}
    >
      <Tabs defaultValue="conta" className="max-w-3xl">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="conta">Conta</TabsTrigger>
          <TabsTrigger value="vagas">Preferências</TabsTrigger>
          <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
          <TabsTrigger value="privacidade">Privacidade</TabsTrigger>
        </TabsList>

        <TabsContent value="conta" className="mt-5 space-y-5">
          <div className="surface-card space-y-4 p-5">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Email da conta</Label>
              <Input value={user?.email ?? ""} readOnly />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Nova senha</Label>
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Mínimo de 6 caracteres"
              />
            </div>
            <Button
              onClick={async () => {
                if (password.length < 6) {
                  toast.error("Use pelo menos 6 caracteres.");
                  return;
                }
                const { error } = await supabase.auth.updateUser({ password });
                if (error) {
                  toast.error("Não foi possível alterar a senha.");
                  return;
                }
                setPassword("");
                toast.success("Senha atualizada.");
              }}
            >
              Atualizar senha
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="vagas" className="mt-5">
          <div className="surface-card grid gap-4 p-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Cargo-alvo</Label>
              <Input
                value={preferences.target_role || profile?.target_role || ""}
                onChange={(event) =>
                  setPreferences({ ...preferences, target_role: event.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Senioridade</Label>
              <Select
                value={preferences.seniority || profile?.seniority || ""}
                onValueChange={(value) => setPreferences({ ...preferences, seniority: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {SENIORITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Modelo de trabalho</Label>
              <Select
                value={preferences.work_model || profile?.work_model || ""}
                onValueChange={(value) => setPreferences({ ...preferences, work_model: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {WORK_MODEL_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Localização desejada</Label>
              <Input
                value={preferences.desired_location || profile?.desired_location || ""}
                onChange={(event) =>
                  setPreferences({ ...preferences, desired_location: event.target.value })
                }
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs text-muted-foreground">Pretensão salarial</Label>
              <Input
                value={preferences.salary_expectation || profile?.salary_expectation || ""}
                onChange={(event) =>
                  setPreferences({ ...preferences, salary_expectation: event.target.value })
                }
              />
            </div>
            <Button
              className="sm:col-span-2"
              onClick={async () => {
                await saveProfile.mutateAsync({
                  target_role: (preferences.target_role || profile?.target_role) ?? null,
                  seniority: (preferences.seniority || profile?.seniority) ?? null,
                  work_model: (preferences.work_model || profile?.work_model) ?? null,
                  desired_location:
                    (preferences.desired_location || profile?.desired_location) ?? null,
                  salary_expectation:
                    (preferences.salary_expectation || profile?.salary_expectation) ?? null,
                });
                toast.success("Preferências salvas.");
              }}
            >
              Salvar preferências
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="notificacoes" className="mt-5">
          <div className="surface-card space-y-4 p-5">
            <label className="flex items-center justify-between gap-4">
              <span className="text-sm">Avisar quando surgirem vagas com match alto</span>
              <Switch
                checked={notifications.matches}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, matches: checked })
                }
              />
            </label>
            <label className="flex items-center justify-between gap-4">
              <span className="text-sm">Resumo semanal das candidaturas</span>
              <Switch
                checked={notifications.weekly}
                onCheckedChange={(checked) => setNotifications({ ...notifications, weekly: checked })}
              />
            </label>
            <p className="text-xs text-muted-foreground">
              As preferências ficam salvas neste dispositivo enquanto o envio de emails não estiver
              ativado.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="privacidade" className="mt-5 space-y-4">
          <div className="surface-card space-y-3 p-5">
            <h2 className="font-display text-base font-semibold">Seus dados</h2>
            <p className="text-sm text-muted-foreground">
              Somente você acessa seu perfil, currículos e candidaturas. Usamos suas informações
              apenas para calcular compatibilidade e gerar currículos com base no que você cadastrou.
            </p>
          </div>
          <div className="surface-card space-y-3 border-[var(--destructive)]/30 p-5">
            <h2 className="font-display text-base font-semibold text-[var(--destructive)]">
              Excluir conta
            </h2>
            <p className="text-sm text-muted-foreground">
              Ao excluir, apagamos seu perfil, experiências, currículos e candidaturas. A ação não pode
              ser desfeita.
            </p>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!window.confirm("Tem certeza? Todos os seus dados serão apagados.")) return;
                await supabase.from("profiles").delete().eq("id", user!.id);
                await signOut();
                toast.success("Seus dados foram removidos.");
                navigate({ to: "/" });
              }}
            >
              Excluir minha conta e meus dados
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
