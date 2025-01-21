const { app,port } = require("./src/main/main")

const db = require("./src/config/db")
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
