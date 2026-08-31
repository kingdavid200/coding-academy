"use client";

import { useState } from "react";
import { Card, CardBody } from "@/components/ui/Card";
import { Field, Input, Textarea } from "@/components/ui/Form";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Feedback";
import { useAdminMutation } from "@/components/admin/useAdminMutation";

type Option = { text: string; isCorrect: boolean };

export type QuestionFormValues = {
  id?: string;
  prompt: string;
  explanation: string;
  options: Option[];
};

const emptyOptions: Option[] = [
  { text: "", isCorrect: true },
  { text: "", isCorrect: false },
  { text: "", isCorrect: false },
  { text: "", isCorrect: false },
];

export function QuestionForm({
  quizId,
  initial,
  onDone,
}: {
  quizId: string;
  initial?: Partial<QuestionFormValues>;
  onDone?: () => void;
}) {
  const editing = Boolean(initial?.id);
  const { run, pending, error, fieldErrors, message } = useAdminMutation();

  const [prompt, setPrompt] = useState(initial?.prompt ?? "");
  const [explanation, setExplanation] = useState(initial?.explanation ?? "");
  const [options, setOptions] = useState<Option[]>(
    initial?.options && initial.options.length >= 2 ? initial.options : emptyOptions,
  );

  function setOption(index: number, patch: Partial<Option>) {
    setOptions((prev) => prev.map((opt, i) => (i === index ? { ...opt, ...patch } : opt)));
  }
  function setCorrect(index: number) {
    setOptions((prev) => prev.map((opt, i) => ({ ...opt, isCorrect: i === index })));
  }
  function addOption() {
    if (options.length >= 6) return;
    setOptions((prev) => [...prev, { text: "", isCorrect: false }]);
  }
  function removeOption(index: number) {
    if (options.length <= 2) return;
    setOptions((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (!next.some((o) => o.isCorrect)) next[0].isCorrect = true;
      return next;
    });
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const payload = {
      ...(editing ? {} : { quizId }),
      prompt,
      explanation,
      options: options.map((o) => ({ text: o.text.trim(), isCorrect: o.isCorrect })),
    };
    const result = await run(
      editing ? `/api/admin/questions/${initial!.id}` : "/api/admin/questions",
      payload,
      { method: editing ? "PATCH" : "POST", successMessage: editing ? "Question saved." : "Question added." },
    );
    if (result.ok && !editing) {
      setPrompt("");
      setExplanation("");
      setOptions(emptyOptions);
      onDone?.();
    }
  }

  return (
    <Card>
      <CardBody>
        {error ? <Alert tone="danger" className="mb-4">{error}</Alert> : null}
        {message ? <Alert tone="success" className="mb-4">{message}</Alert> : null}
        {fieldErrors.options ? (
          <Alert tone="danger" className="mb-4">{fieldErrors.options}</Alert>
        ) : null}
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <Field label="Question" htmlFor="q-prompt" error={fieldErrors.prompt}>
            <Textarea id="q-prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={2} required />
          </Field>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Answer options</legend>
            <p className="text-xs text-[var(--color-ink-muted)]">
              Select the radio button next to the correct answer. Two to six options.
            </p>
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="correct-option"
                  checked={option.isCorrect}
                  onChange={() => setCorrect(index)}
                  aria-label={`Mark option ${index + 1} correct`}
                />
                <Input
                  value={option.text}
                  onChange={(e) => setOption(index, { text: e.target.value })}
                  placeholder={`Option ${index + 1}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  disabled={options.length <= 2}
                  className="rounded border border-[var(--color-border-strong)] px-2 py-1 text-xs disabled:opacity-40"
                  aria-label={`Remove option ${index + 1}`}
                >
                  Remove
                </button>
              </div>
            ))}
            {options.length < 6 ? (
              <Button type="button" variant="ghost" size="sm" onClick={addOption}>
                Add option
              </Button>
            ) : null}
          </fieldset>

          <Field
            label="Explanation"
            htmlFor="q-explanation"
            hint="Shown after submission to explain the correct answer."
            error={fieldErrors.explanation}
          >
            <Textarea
              id="q-explanation"
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              rows={2}
              required
            />
          </Field>

          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : editing ? "Save question" : "Add question"}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
