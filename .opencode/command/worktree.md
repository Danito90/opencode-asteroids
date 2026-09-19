---
description: Crea un worktree local usando el argumento como nombre
agent: build
---

Recibe el nombre del worktree desde `$ARGUMENTS`. Analiza el argumento completo, incluso si contiene espacios, y ejecuta únicamente este comando desde el directorio actual, reemplazando `<nombre-del-worktree>` por ese nombre:

```bash
git worktree add ".worktrees/$ARGUMENTS"
```

No cambies de directorio. No ejecutes ningún otro comando. No hagas ninguna otra modificación.
