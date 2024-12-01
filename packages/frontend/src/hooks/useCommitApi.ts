import { ICommit } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { prisma } from "../lib/prisma";

export const useCreateCommit = (commit: ICommit) => {
  return useMutation({
    mutationKey: ["createCommit"],
    mutationFn: async () =>
      await prisma.commit.create({
        data: {
          message: commit.message!,
          branchId: commit.branchId!,
        },
      }),
  });
};

export const useGetCommitByBranchId = (branchId: string) => {
  return useQuery({
    queryKey: ["getCommitByBranchId"],
    queryFn: async () => await prisma.commit.findMany({ where: { branchId } }),
  });
};
