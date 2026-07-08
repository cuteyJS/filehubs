import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getAllFiles, getFileById, createFile, deleteFile, incrementDownloads } from "./db";
import { storagePut, storageGet } from "./storage";
import { nanoid } from "nanoid";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  files: router({
    list: publicProcedure.query(async () => {
      return await getAllFiles();
    }),

    getById: publicProcedure
      .input(z.object({ fileId: z.number() }))
      .query(async ({ input }) => {
        return await getFileById(input.fileId);
      }),

    upload: protectedProcedure
      .input(z.object({
        fileName: z.string(),
        fileSize: z.number(),
        mimeType: z.string(),
        fileData: z.instanceof(Buffer),
        description: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const fileKey = `files/${nanoid()}/${input.fileName}`;
        const { url } = await storagePut(fileKey, input.fileData, input.mimeType);

        const file = await createFile({
          fileKey,
          fileName: input.fileName,
          fileSize: input.fileSize,
          mimeType: input.mimeType,
          storageUrl: url,
          uploaderId: ctx.user.id,
          description: input.description || null,
          downloads: 0,
        });

        return file;
      }),

    delete: protectedProcedure
      .input(z.object({ fileId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const file = await getFileById(input.fileId);
        if (!file) throw new Error("File not found");

        // 업로더 또는 관리자만 삭제 가능
        if (file.uploaderId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new Error("You don't have permission to delete this file");
        }

        await deleteFile(input.fileId);
        return { success: true };
      }),

    download: publicProcedure
      .input(z.object({ fileId: z.number() }))
      .mutation(async ({ input }) => {
        const file = await getFileById(input.fileId);
        if (!file) throw new Error("File not found");

        // 다운로드 횟수 증가
        await incrementDownloads(input.fileId);

        // 서명된 URL 생성
        const { url } = await storageGet(file.fileKey);

        return {
          url,
          fileName: file.fileName,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
