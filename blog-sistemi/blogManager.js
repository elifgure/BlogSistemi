const fs = require("fs");
const path = require("path");
const EventEmitter = require("events");

class blogManager extends EventEmitter {
  constructor() {
    super();
    this.blogsDir = path.join(__dirname, "blogs");
    this.logsDir = path.join(__dirname, "logs");

    this.on("blogCreated", this.logActivity);
    this.on("blogRead", this.logActivity);
  }
  logActivity(message) {
    const logPath = path.join(this.logsDir, "activity.log");
    const logMessage = `${new Date().toISOString()} - ${message}\n`;
    fs.appendFile(logPath, logMessage, (err) => {
      if (err) console.error("Log Hatası:", err);
    });
  }
  createBlog(title, content, res) {
    const id = Date.now().toString();
    const blogData = {
      id,
      title,
      content,
      date: new Date().toISOString().slice(0, 10),
      readCount: 0,
    };
    const blogPath = path.join(this.blogsDir, `${id}.JSON`);
    fs.writeFile(blogPath, JSON.stringify(blogData, null, 2), (err) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/html" });
        res.end("<h1>Blog oluşturulamadı.</h1>");
      }
      this.emit("blogCreated", `Blog oluşturuldu: ${title}`);
      res.writeHead(201);
      res.end("Blog başarıyla oluşturuldu.");
    });
  }
  readBlog(id, res) {
    const blogPath = path.join(this.blogsDir, `blog-${id}.json`); 
    fs.readFile(blogPath, "utf-8", (err, data) => {
      if (err) {
        res.writeHead(404, { "Content-Type": "text/html" });
        res.end(`Blog bulunamadı: blog-${id}.json`);
      }
      const blog = JSON.parse(data);
      blog.readCount++;
      fs.writeFile(blogPath, JSON.stringify(blog, null, 2), (err) => {
        if (err) {
          res.writeHead(500, { "Content-Type": "text/html" });
          res.end("<h1>Blog güncellenemedi.</h1>");
        } else {
          this.emit("blogRead", `Blog okundu: ${blog.title}`);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(blog));
        }
      });
    });
  }
  getAllBlogs(res) {
    fs.readdir(this.blogsDir, (err, files) => {
      if (err) {
        res.writeHead(500);
        return res.end("<h1>Bloglar okunamadı.</h1>");
      }
      const blogs = [];
      let okunan = 0;
      files.forEach((file) => {
        const filePath = path.join(this.blogsDir, file);
        fs.readFile(filePath, "utf-8", (err, data) => {
          okunan++;
          if (!err) blogs.push(JSON.parse(data));
          if (okunan === files.length) {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(blogs));
          }
        });
      });
    });
  }
}
module.exports = blogManager;
