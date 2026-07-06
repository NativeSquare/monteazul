"use client";

import * as React from "react";
import { useMutation, useQuery } from "convex/react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { api } from "@packages/backend/convex/_generated/api";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Spinner } from "@/components/ui/spinner";
import { getConvexErrorMessage } from "@/utils/getConvexErrorMessage";
import {
  DEFAULT_HORARIO,
  HorarioEditor,
  validateHorario,
  type Horario,
} from "@/components/app/entrepreneur/horario-editor";

const formSchema = z.object({
  name: z.string().min(1, "El nombre del negocio es obligatorio."),
  category: z.string().min(1, "Selecciona una categoría."),
  description: z.string().min(1, "La descripción es obligatoria."),
  whatsapp: z
    .string()
    .regex(
      /^\d{10}$/,
      "El WhatsApp debe tener exactamente 10 dígitos, sin +57 ni espacios.",
    ),
  torreApto: z.string().optional(),
  instagram: z.string().optional(),
  contactName: z.string().optional(),
  resides: z.string().min(1, "Indica si resides en Monteazul."),
  notas: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

/**
 * The entrepreneur fiche wizard (back-office onboarding). Collects the Commerce
 * fields, shows the Comida sub-categories only for « Comida y bebida », and the
 * structured Horario editor. On submit it calls the real `submitCommerce`
 * mutation, surfaces validation errors inline, and redirects to « Mi negocio ».
 */
export function FicheWizard() {
  const router = useRouter();
  const options = useQuery(api.table.commerces.getFormOptions);
  const submitCommerce = useMutation(api.table.commerces.submitCommerce);

  const [subcategories, setSubcategories] = React.useState<string[]>([]);
  const [horario, setHorario] = React.useState<Horario>(DEFAULT_HORARIO);
  const [horarioError, setHorarioError] = React.useState<string | null>(null);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: "",
      description: "",
      whatsapp: "",
      torreApto: "",
      instagram: "",
      contactName: "",
      resides: "",
      notas: "",
    },
  });

  const category = useWatch({ control: form.control, name: "category" });
  const isComida = options ? category === options.comidaCategory : false;

  function toggleSubcategory(value: string, checked: boolean) {
    setSubcategories((prev) =>
      checked ? [...prev, value] : prev.filter((s) => s !== value),
    );
  }

  async function onSubmit(data: FormValues) {
    setFormError(null);

    const horarioValidation = validateHorario(horario);
    if (horarioValidation) {
      setHorarioError(horarioValidation);
      return;
    }
    setHorarioError(null);

    // Sub-categories only apply to « Comida y bebida ».
    const subcats = isComida ? subcategories : [];

    setIsLoading(true);
    try {
      await submitCommerce({
        name: data.name,
        category: data.category,
        subcategories: subcats.length > 0 ? subcats : undefined,
        description: data.description,
        whatsapp: data.whatsapp,
        horario,
        torreApto: data.torreApto || undefined,
        instagram: data.instagram || undefined,
        contactName: data.contactName || undefined,
        resides: data.resides,
        notas: data.notas || undefined,
      });
      router.push("/mi-negocio");
    } catch (error) {
      setFormError(getConvexErrorMessage(error));
      setIsLoading(false);
    }
  }

  if (options === undefined) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Registra tu negocio</CardTitle>
        <p className="text-muted-foreground text-sm">
          Completa la ficha. Quedará pendiente de aprobación antes de publicarse
          en el directorio.
        </p>
      </CardHeader>
      <CardContent>
        <form id="form-fiche" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            {formError && (
              <div className="text-destructive text-sm">{formError}</div>
            )}

            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="name">Nombre del negocio</FieldLabel>
                  <Input {...field} id="name" aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="category"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="category">Categoría</FieldLabel>
                  <NativeSelect
                    {...field}
                    id="category"
                    aria-invalid={fieldState.invalid}
                    className="w-full"
                  >
                    <NativeSelectOption value="">
                      Selecciona una categoría
                    </NativeSelectOption>
                    {options.categories.map((cat) => (
                      <NativeSelectOption key={cat} value={cat}>
                        {cat}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {isComida && (
              <Field>
                <FieldLabel>Subcategorías</FieldLabel>
                <div className="grid gap-2 sm:grid-cols-2">
                  {options.comidaSubcategories.map((sub) => {
                    const id = `sub-${sub}`;
                    return (
                      <div key={sub} className="flex items-center gap-2">
                        <Checkbox
                          id={id}
                          checked={subcategories.includes(sub)}
                          onCheckedChange={(checked) =>
                            toggleSubcategory(sub, checked === true)
                          }
                        />
                        <Label htmlFor={id} className="font-normal">
                          {sub}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </Field>
            )}

            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="description">Descripción</FieldLabel>
                  <Textarea
                    {...field}
                    id="description"
                    aria-invalid={fieldState.invalid}
                    rows={3}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="whatsapp"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="whatsapp">WhatsApp</FieldLabel>
                  <Input
                    {...field}
                    id="whatsapp"
                    inputMode="numeric"
                    placeholder="3182173887"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <HorarioEditor
              value={horario}
              onChange={setHorario}
              error={horarioError}
            />

            <Controller
              name="torreApto"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="torreApto">
                    Torre y apartamento
                  </FieldLabel>
                  <Input {...field} id="torreApto" placeholder="Torre 4 · Apto 926" />
                </Field>
              )}
            />

            <Controller
              name="instagram"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="instagram">Instagram</FieldLabel>
                  <Input {...field} id="instagram" placeholder="https://instagram.com/…" />
                </Field>
              )}
            />

            <Controller
              name="contactName"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="contactName">
                    Nombre de contacto
                  </FieldLabel>
                  <Input {...field} id="contactName" />
                </Field>
              )}
            />

            <Controller
              name="resides"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="resides">
                    ¿Resides en Monteazul?
                  </FieldLabel>
                  <NativeSelect
                    {...field}
                    id="resides"
                    aria-invalid={fieldState.invalid}
                    className="w-full"
                  >
                    <NativeSelectOption value="">
                      Selecciona una opción
                    </NativeSelectOption>
                    {options.residesValues.map((value) => (
                      <NativeSelectOption key={value} value={value}>
                        {value}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="notas"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="notas">Notas</FieldLabel>
                  <Textarea {...field} id="notas" rows={2} />
                </Field>
              )}
            />

            <Field>
              <Button type="submit" form="form-fiche" disabled={isLoading}>
                {isLoading ? <Spinner /> : "Enviar mi negocio"}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
