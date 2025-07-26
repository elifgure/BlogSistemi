require("dotenv").config({path:"./config/.env"})
const http = require("http")
const url = require("url")
const BlogManager = require("./blogManager")
const { json } = require("stream/consumers")
const blogManager = new BlogManager()

const PORT = process.env.PORT || 3000
const server = http.createServer((req, res) =>{
const parsedUrl = url.parse(req.url, true)
const method = req.method
const pathname = parsedUrl.pathname
if (method === "GET" && pathname === "/"){
    res.writeHead(200, {"Content-Type": "text/html"})
    res.end("<h1>Welcome to the Blog API</h1>")
}else if( method === "GET" && pathname === "/blogs"){
    blogManager.getAllBlogs(res)
}else if(method === "GET" && pathname.startsWith("/blogs/")){
    const id = pathname.split("/")[2]
    blogManager.readBlog(id, res)
}else if (method === "POST" && pathname === "/create-blog"){
    let body = ""
    req.on("data", chunk => body += chunk)
    req.on("end", ()=>{
        const blog = JSON.parse(body)
        blogManager.createBlog(blog.title, blog.content, res)
    })
}else{
    res.writeHead(404, {"Content-Type": "text/html"})
    res.end("<h1>404 Not Found</h1>")
}
})


server.listen(PORT, ()=>{
    console.log(`Server is running on http://localhost:${PORT}`)
})