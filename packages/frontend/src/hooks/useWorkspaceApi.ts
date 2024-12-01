import { prisma } from "@/lib/prisma";
import { IWorkspace } from "@/types";
import { useMutation } from "@tanstack/react-query";

export const useCreateWorkspace = (workspace: IWorkspace) => {
  return useMutation({
    mutationKey: ["createWorkspace"],
    mutationFn: async () =>
      await prisma.workspace.create({
        data: {
          name: workspace.name!,
          userId: workspace.userId!,
          artifact_url: workspace.artifact_url!,
        },
      }),
  });
};
