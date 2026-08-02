"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type FormFieldType = {
  name: string;
  label: string;
  type: "text" | "number" | "select";
  options?: any[]; // Can be string[] or {value: string, label: string}[]
  placeholder?: string;
  required?: boolean;
};

interface DynamicFieldBuilderProps {
  fields: FormFieldType[];
}

export function DynamicFieldBuilder({ fields }: DynamicFieldBuilderProps) {
  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <div key={field.name} className="space-y-2">
          <Label htmlFor={field.name}>
            {field.label} {field.required && <span className="text-destructive">*</span>}
          </Label>
          {field.type === "select" ? (
            <select
              id={field.name}
              name={field.name}
              required={true}
              defaultValue=""
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="" disabled>
                {field.placeholder || "Select an option"}
              </option>
              {field.options?.map((opt, idx) => {
                const isObject = typeof opt === 'object' && opt !== null;
                const value = isObject ? opt.value : opt;
                const label = isObject ? opt.label : opt;
                return (
                  <option key={value || idx} value={value}>
                    {label}
                  </option>
                );
              })}
            </select>
          ) : (
            <Input
              id={field.name}
              name={field.name}
              type={field.type}
              placeholder={field.placeholder}
              required={true}
            />
          )}
        </div>
      ))}
    </div>
  );
}
