import Dao from '../../model/Dao';
import { SqlParameter, SqlQuerySpec } from '@azure/cosmos';
import { IBlog } from '../../model/Blog/BlogModel';

class BlogController {
  public blogDao: Dao;
  public query: string;
  public parameters: SqlParameter[];
  private updatedParameters: string[] = ['updatedIsDeleted'];

  constructor(blogDao: Dao) {
    this.blogDao = blogDao;
  }

  async showBlogs(blog?: any, logical: string = 'AND') {
    this.query = 'SELECT * FROM Blogs b';
    this.parameters = [];
    let index: number = 0;
    if (blog) {
      for (const prop in blog) {
        if (
          blog.hasOwnProperty(prop) &&
          blog[prop] &&
          this.updatedParameters.indexOf(prop) === -1
        ) {
          let propActive = prop;
          let operator = '=';
          if (prop === 'startAt') {
            propActive = 'positionIndex';
            operator = '>=';
          }
          if (prop === 'endAt') {
            propActive = 'positionIndex';
            operator = '<=';
          }
          if (index === 0) {
            this.query += ` WHERE b.${propActive}${operator}@${prop}`;
          } else {
            this.query += ` ${logical} b.${propActive}${operator}@${prop}`;
          }
          this.parameters.push({
            name: `@${prop}`,
            value: blog[prop]
          });
          index = index + 1;
        }
      }
    }

    this.query += ' ORDER BY b.lastEdited DESC';

    const querySpec: SqlQuerySpec = {
      query: this.query,
      parameters: this.parameters
    };

    return this.blogDao
      .find(querySpec)
      .then(blog => {
        return blog;
      })
      .catch(err => {
        throw new Error(err);
      });
  }

  async addBlog(blog?: any) {
    return new Promise(async (resolve, reject) => {
      blog.lastEdited = Date.now();
      blog.isDeleted = false;

      // get total of document
      // to assign manual indexing
      const blogs = await this.showBlogs();
      blog.positionIndex = blogs.length;

      this.blogDao
        .addItem(blog)
        .then(blog => {
          return resolve(blog);
        })
        .catch(err => {
          return reject(new Error(err));
        });
    });
  }

  async updateBlog(blogId: string, blog: any, userId: string) {
    return new Promise((resolve, reject) => {
      this.blogDao
        .getItem(blogId)
        .then(result => {
          if (result.code === 404) {
            return reject(new Error('Blog not found'));
          }

          const blogFound = blog as IBlog;
          if (blogFound.user !== userId) {
            return reject(
              new Error("You dont't have the authorization to update the blog")
            );
          }

          this.blogDao
            .updateItem(blogId, blog)
            .then(blogUpdated => {
              if (blogUpdated.code === 404) {
                return reject(blogUpdated.body);
              }
              return resolve(blogUpdated);
            })
            .catch(err => {
              return reject(err);
            });
        })
        .catch(err => reject(err));
    });
  }

  async deleteBlog(id: string) {
    return new Promise((resolve, reject) => {
      const blog = {} as any;
      blog.id = id;
      this.showBlogs(blog).then(blogsResult => {
        if (blogsResult.length === 0) {
          return reject(new Error('No blog found'));
        }

        const blogClone = Object.assign({}, blogsResult[0]);
        this.blogDao
          .deleteItem(id)
          .then(() => {
            return resolve(blogClone);
          })
          .catch(err => {
            return reject(err);
          });
      });
    });
  }
}

export default BlogController;
