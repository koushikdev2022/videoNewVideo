const { app,port } = require("./src/main/main")

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
