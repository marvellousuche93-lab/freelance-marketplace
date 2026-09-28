/**
 * useForm — small form state helper.
 *
 * Not a replacement for React Hook Form. Just enough to reduce
 * boilerplate for the medium-sized forms in this app.
 *
 * Usage:
 *   const form = useForm({ email: "", name: "" });
 *   form.values.email
 *   form.setField("email", "x")
 *   form.handleChange("email")  // returns an onChange handler
 *   form.setErrors({ email: "required" })
 *   form.reset()
 *   form.isDirty()
 *
 * For file uploads, call setField("cover", fileObject).
 */

import { useCallback, useMemo, useRef, useState } from "react";

export function useForm(initialValues = {}) {
  const initialRef = useRef(initialValues);
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const setField = useCallback((field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!(field in prev)) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const handleChange = useCallback(
    (field) => (e) => {
      const v =
        e?.target?.type === "checkbox" ? e.target.checked : e?.target?.value;
      setField(field, v);
    },
    [setField]
  );

  const reset = useCallback((next = initialRef.current) => {
    initialRef.current = next;
    setValues(next);
    setErrors({});
    setFormError("");
  }, []);

  const isDirty = useCallback(() => {
    const a = initialRef.current;
    const b = values;
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const k of keys) {
      if (a[k] !== b[k]) return true;
    }
    return false;
  }, [values]);

  const setAll = useCallback((next) => {
    setValues((prev) => ({ ...prev, ...next }));
  }, []);

  return useMemo(
    () => ({
      values,
      errors,
      submitting,
      formError,
      setField,
      setAll,
      setErrors,
      setSubmitting,
      setFormError,
      handleChange,
      reset,
      isDirty,
    }),
    [
      values,
      errors,
      submitting,
      formError,
      setField,
      setAll,
      setSubmitting,
      handleChange,
      reset,
      isDirty,
    ]
  );
}

export default useForm;