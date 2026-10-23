'use server';

import { submitTastingRequest } from "@/app/actions/tastingActions";

export async function sendTastingRequest(formData: FormData) {
    return submitTastingRequest(formData);
}

