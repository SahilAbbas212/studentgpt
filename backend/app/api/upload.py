from fastapi import (
    APIRouter,
    UploadFile,
    File,
    HTTPException
)

import os
import traceback

from app.services.parser_service import (
    parse_pdf,
    parse_docx,
    parse_pptx
)

from app.ai.embedding_service import (
    create_embedding,
    chunk_text
)

from app.ai.pinecone_service import (
    index
)

router = APIRouter()

UPLOAD_DIR = "uploads"

os.makedirs(
    UPLOAD_DIR,
    exist_ok=True
)

@router.post("/")
async def upload_file(
    file: UploadFile = File(...)
):

    try:

        file_path = os.path.join(
            UPLOAD_DIR,
            file.filename
        )

        with open(file_path, "wb") as f:

            content = await file.read()

            f.write(content)

        extracted_text = ""

        if file.filename.endswith(".pdf"):

            extracted_text = parse_pdf(
                file_path
            )

        elif file.filename.endswith(".docx"):

            extracted_text = parse_docx(
                file_path
            )

        elif file.filename.endswith(".pptx"):

            extracted_text = parse_pptx(
                file_path
            )

        elif file.filename.endswith(".txt"):

            with open(
                file_path,
                "r",
                encoding="utf-8"
            ) as f:

                extracted_text = f.read()

        else:

            raise HTTPException(
                status_code=400,
                detail="Unsupported file type"
            )

        if not extracted_text.strip():

            raise HTTPException(
                status_code=400,
                detail="No text extracted from file"
            )

        chunks = chunk_text(
            extracted_text
        )

        vectors = []

        for i, chunk in enumerate(chunks):

            embedding = create_embedding(
                chunk
            )

            vectors.append(
                {
                    "id":
                    f"{file.filename}-{i}",

                    "values":
                    embedding,

                    "metadata": {
                        "text": chunk
                    }
                }
            )

        index.upsert(
            vectors=vectors
        )

        return {
            "filename": file.filename,
            "text": extracted_text[:5000],
            "message":
            "Uploaded successfully"
        }

    except Exception as e:

        traceback.print_exc()

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )