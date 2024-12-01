import { prisma } from "@/lib/prisma";
import { IBranch } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useCreateBranch = (branch: IBranch) => {
  return useMutation({
    mutationKey: ["createBranch"],
    mutationFn: async () =>
      await prisma.branch.create({
        data: {
          name: branch.name!,
          workspaceId: branch.workspaceId!,
        },
      }),
  });
};

export const useGetBranches = (workspaceId: string) => {
  return useQuery({
    queryKey: ["getBranches"],
    queryFn: async () =>
      await prisma.branch.findMany({ where: { workspaceId } }),
  });
};
