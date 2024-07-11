import { pgTable, serial, text, varchar, integer, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

//user table
export const UsersTable = pgTable("users", {
    id: serial("id").primaryKey(),
    fullname: text("full_name"),
    phone: varchar("phone", { length: 100 }),
    address: varchar("address", { length: 100 }),
    score: integer("score"),
})

export const ProfilesTable = pgTable("profiles", {
    id: serial("id").primaryKey(),
    bio: varchar("bio", { length: 256 }),
    userId: integer("user_id").notNull().references(() => UsersTable.id, { onDelete: "cascade" }), //fk ref id in users table
});

export const PostsTable = pgTable("posts", {
    id: serial("id").primaryKey(),  //primary key
    text: varchar("text", { length: 256 }),
    authorId: integer("author_id")
        .notNull()
        .references(() => UsersTable.id),
});

export const CategoriesTable = pgTable("categories", {
    id: serial("id").primaryKey(), //primary key
    name: varchar("name", { length: 256 }),
});
// Table schema for post_categories table
export const PostOnCategoriesTable = pgTable("post_categories", { //junction table : post&categories
    postId: integer("post_id").notNull().references(() => PostsTable.id),  //fk ref id in posts table
    categoryId: integer("category_id").notNull().references(() => CategoriesTable.id),  //fk ref id in categories table
}, (table) => {
    return {
        compositeKey: primaryKey(table.postId, table.categoryId),
    }
});

//relationship : post (n) - (n) categories
export const CategoriesRelations = relations(CategoriesTable, ({ many }) => ({
    postCategories: many(PostOnCategoriesTable),
}));
//relationship : post (1) - (1) author[user]  post(n) - (n) post_category
export const postsRelations = relations(PostsTable, ({ one, many }) => ({
    author: one(UsersTable, {
        fields: [PostsTable.authorId],
        references: [UsersTable.id]
    }),
    postCategories: many(PostOnCategoriesTable)
}))
//relationship :  post_category (1) - (n) category && post_category (1) - (n) post
export const postCategoriesRelations = relations(PostOnCategoriesTable, ({ one }) => ({
    post: one(PostsTable, {
        fields: [PostOnCategoriesTable.postId],
        references: [PostsTable.id],
    }),
    category: one(CategoriesTable, {
        fields: [PostOnCategoriesTable.categoryId],
        references: [CategoriesTable.id],
    }),
}))
//relationship : user (1) - (1) profile & user(1) - (n) posts
export const usersRelations = relations(UsersTable, ({ one, many }) => ({  //1st table : where the relation is defined  
    profile: one(ProfilesTable, {   // 2nd table
        fields: [UsersTable.id],  //pk id in users table
        references: [ProfilesTable.userId]  //fk ref id in profiles table
    }),
    post: many(PostsTable)
}));

export type TIUser = typeof UsersTable.$inferInsert;
export type TSUser = typeof UsersTable.$inferSelect;
export type TIProfile = typeof ProfilesTable.$inferInsert;
export type TSProfile = typeof ProfilesTable.$inferSelect;
