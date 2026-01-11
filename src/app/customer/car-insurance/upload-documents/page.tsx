// src/app/results/page.tsx
import DocumentsUploadPage from "@/app/customer/car-insurance/upload-documents/DocumentsUpload";
import { Suspense } from 'react';

export default function Results() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <DocumentsUploadPage />
        </Suspense>
    );
}