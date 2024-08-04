const Hapi = require('@hapi/hapi');
const { nanoid } = require('nanoid');

const init = async () => {
  const server = Hapi.server({
    port: 9000,
    host: 'localhost'
  });

  let books = [
    { id: nanoid(), name: 'Buku A', year: 2010, author: 'John Doe', summary: 'Lorem ipsum dolor sit amet', publisher: 'Dicoding Indonesia', pageCount: 100, readPage: 25, reading: false, finished: false, insertedAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: nanoid(), name: 'Buku A Revisi', year: 2011, author: 'Jane Doe', summary: 'Lorem Dolor sit Ametttt', publisher: 'Dicoding', pageCount: 200, readPage: 26, reading: false, finished: false, insertedAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ];

  server.route([
    {
      method: 'POST',
      path: '/books',
      handler: (request, h) => {
        const {
          name, year, author, summary, publisher, pageCount, readPage, reading
        } = request.payload;

        if (!name) {
          return h.response({
            status: 'fail',
            message: 'Gagal menambahkan buku. Mohon isi nama buku'
          }).code(400);
        }

        if (readPage > pageCount) {
          return h.response({
            status: 'fail',
            message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount'
          }).code(400);
        }

        const id = nanoid();
        const finished = pageCount === readPage;
        const insertedAt = new Date().toISOString();
        const updatedAt = insertedAt;

        const newBook = {
          id, name, year, author, summary, publisher, pageCount, readPage, reading, finished, insertedAt, updatedAt
        };

        books.push(newBook);

        return h.response({
          status: 'success',
          message: 'Buku berhasil ditambahkan',
          data: {
            bookId: id
          }
        }).code(201);
      }
    },
    {
      method: 'GET',
      path: '/books',
      handler: (request, h) => {
        const { name, reading, finished } = request.query;

        let filteredBooks = books;

        if (name !== undefined) {
          filteredBooks = filteredBooks.filter(book => book.name.toLowerCase().includes(name.toLowerCase()));
        }

        if (reading !== undefined) {
          filteredBooks = filteredBooks.filter(book => book.reading === (reading === '1'));
        }

        if (finished !== undefined) {
          filteredBooks = filteredBooks.filter(book => book.finished === (finished === '1'));
        }

        const response = filteredBooks.map(({ id, name, publisher }) => ({ id, name, publisher }));

        return {
          status: 'success',
          data: {
            books: response
          }
        };
      }
    },
    {
      method: 'GET',
      path: '/books/{id}',
      handler: (request, h) => {
        const { id } = request.params;
        const book = books.find(b => b.id === id);

        if (!book) {
          return h.response({
            status: 'fail',
            message: 'Buku tidak ditemukan'
          }).code(404);
        }

        return {
          status: 'success',
          data: {
            book
          }
        };
      }
    },
    {
      method: 'PUT',
      path: '/books/{id}',
      handler: (request, h) => {
        const { id } = request.params;
        const {
          name, year, author, summary, publisher, pageCount, readPage, reading
        } = request.payload;

        if (!name) {
          return h.response({
            status: 'fail',
            message: 'Gagal memperbarui buku. Mohon isi nama buku'
          }).code(400);
        }

        if (readPage > pageCount) {
          return h.response({
            status: 'fail',
            message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount'
          }).code(400);
        }

        const index = books.findIndex(b => b.id === id);

        if (index === -1) {
          return h.response({
            status: 'fail',
            message: 'Gagal memperbarui buku. Id tidak ditemukan'
          }).code(404);
        }

        books[index] = {
          ...books[index],
          name,
          year,
          author,
          summary,
          publisher,
          pageCount,
          readPage,
          reading,
          finished: pageCount === readPage,
          updatedAt: new Date().toISOString()
        };

        return {
          status: 'success',
          message: 'Buku berhasil diperbarui'
        };
      }
    },
    {
      method: 'DELETE',
      path: '/books/{id}',
      handler: (request, h) => {
        const { id } = request.params;
        const index = books.findIndex(b => b.id === id);

        if (index === -1) {
          return h.response({
            status: 'fail',
            message: 'Buku gagal dihapus. Id tidak ditemukan'
          }).code(404);
        }

        books.splice(index, 1);

        return {
          status: 'success',
          message: 'Buku berhasil dihapus'
        };
      }
    }
  ]);

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();
