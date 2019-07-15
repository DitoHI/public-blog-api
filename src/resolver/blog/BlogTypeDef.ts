export const mutationDef = `
    addBlog(title: String!, content: String!, cover: Upload!, tags: [String!]!): Blog
    updateBlog(id: String!, title: String, content: String, lastEdited: DateTime,
          isDeleted: Boolean, cover: Upload!, hastag: String): Blog
    deleteBlog(id: String!): Blog
`;

export const queryDef = `
    blogs(id: String, title: String, content: String, lastEdited: DateTime, isDeleted: Boolean,
          imageUri: [String], startAt: Int, endAt: Int, tags: [String]
    ): [Blog]
`;
