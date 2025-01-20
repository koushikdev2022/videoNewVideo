const { app } = require("./src/main/main")
require("dotenv").config();
const port = process.env.PORT


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
