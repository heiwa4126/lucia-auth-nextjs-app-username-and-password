"use client";

import React from "react";

export function Form({
    children,
    action
}: {
    children: React.ReactNode;
    action: (prevState: any, formData: FormData) => Promise<ActionResult>;
}) {
    const [state, formAction] = React.useActionState(action, {
        error: null
    });
    return (
        <form action={formAction}>
            {children}
            <p>{state.error}</p>
        </form>
    );
}

export interface ActionResult {
    error: string | null;
}
