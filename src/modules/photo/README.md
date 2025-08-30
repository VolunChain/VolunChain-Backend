# 📸 Photos Module

This module handles uploading, fetching, and deleting images.
Unlike other modules in the application, its architecture is slightly different, since file handling introduces particular requirements (e.g., Supabase Storage, Multer, public URLs).

# 🔑 Key Architectural Differences

No use cases or repositories are used, only maintained Entity to get easy access on this information, but this Entity is generate for mi adapter, adapter interface required a return of PhotoEntity.
The flow is more direct:

Controller → calls the Adapter for Supabase Storage and Prisma for persistence.

Entity → ensures photo consistency (valid URL, userId, metadata).

Dedicated Adapters:

photo-service.adapter.interface.ts → defines the generic interface for a storage service.

supabase-service.adapter.ts → concrete implementation using Supabase Storage.

Simplified Controllers:
Controllers use asyncHandler, validators, and Multer for file processing.

# 📂 Structure

```text
modules/
  photo/
    domain/entities/interfaces/ #interfaces of entity
    domain/entitites/photo.entity.ts #Entity
    infrastructure/
    presentation/controllers/
    presentation/dto
    routes.ts
README.md
```
