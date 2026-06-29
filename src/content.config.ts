import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "zod";

const posts = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/posts" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string())
  })
});

const gists = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/gists" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string())
  })
});

const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    status: z.enum(["active", "paused", "done"]),
    tools: z.array(z.string())
  })
});

const todo = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/todo" }),
  schema: z.object({
    groups: z.array(
      z.object({
        title: z.string(),
        subgroups: z.array(
          z.object({
            title: z.string(),
            tasks: z.array(
              z.object({
                title: z.string(),
                done: z.boolean()
              })
            )
          })
        )
      })
    )
  })
});

export const collections = { posts, gists, projects, todo };
