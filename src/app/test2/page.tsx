import React from 'react';
import { UploadDropzone } from '~/components/upload-dropzone';


const Page = () => {
    const handleFileUpload = (files: File[]) => {
        // Handle the uploaded files here
        console.log(files)
    }

    return (
        <div>
            <UploadDropzone/>
        </div>
    )
}

export default Page;