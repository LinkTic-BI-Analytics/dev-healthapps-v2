import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = React.ComponentProps<typeof Input> & { id: string; label: string; error?: string };

/** Campo con etiqueta accesible y mensaje de error asociado (`aria-describedby`). */
export default function FormField({ id, label, error, ...inputProps }: Props) {
  const errorId = `${id}-error`;
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} aria-invalid={!!error} aria-describedby={error ? errorId : undefined} {...inputProps} />
      {error && (
        <p id={errorId} className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
