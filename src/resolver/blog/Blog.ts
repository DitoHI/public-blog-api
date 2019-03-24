import { IResolvers } from 'graphql-tools';
import { IUser } from '../../model/User/UserModel';
import { DateTime } from '@okgrow/graphql-scalars';

export const typeDef = `
  type Blog {
    id: ID!,
    user: String!,
    title: String,
    content: String,
    lastEdited: DateTime,
    isDeleted: Boolean,
    imageUri: [String],
  }
`;

export const resolvers: IResolvers = {
  DateTime,
  Mutation: {
    addBlog: (async (_, blog, { userController, blogController }) => {
      return userController
        .showUsers({ isActived: true })
        .then((result: any) => {
          if (result.length === 0) {
            throw new Error('user not found');
          }

          if (result.length > 1) {
            throw new Error(`There are ${result.length} users found who are actived. ` +
              'Please inactive the others');
          }

          const user = result[0] as IUser;
          blog.user = user.id;
          blogController
            .addBlog(blog)
            .then((blog: any) => {
              return blog;
            })
            .catch((err: Error) => {
              throw err;
            });
        });
    }),
  },
  Query: {
    blogs: (async (_, {}, { userController, blogController }) => {
      return userController
        .showUsers({ isActived: true })
        .then((result: any) => {
          if (result.length === 0) {
            throw new Error('user not found');
          }

          if (result.length > 1) {
            throw new Error(`There are ${result.length} users found who are actived. ` +
              'Please inactive the others');
          }

          const user = result[0] as IUser;
          blogController
            .showBlogs({ user: user.id })
            .then((blogs: any) => {
              return blogs;
            })
            .catch((err: any) => {
              throw err;
            });
        });
    })
  },
};