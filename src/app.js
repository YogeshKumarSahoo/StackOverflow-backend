const express = require("express");
const axios = require("axios");
require('dotenv').config()
const {
    Question
} = require("./db");

const app = express();  

app.use(express.json());

port = process.env.PORT || 8080;

async function getPage_no(){
    let pageInfo = await Question.find({}).sort({ page_no: -1 })
    let lastpage = (pageInfo[0]).page_no
    let total = await Question.find({page_no:lastpage})
    if (total.length< 30){
        page_no = lastpage
    }
    else{
        page_no = lastpage + 1
    }
    return page_no
}

app.get("/", (req, res) => {
    return res.send("Yes,I did it!");
});

app.post("/questions/load", async (req, res) => {
    let data;
    const page = req.body.page;
    const ispresent = await Question.findOne({
        page_no: page,
    });
    if (ispresent) {
        return res.status(400).json({
            message: `Your requested page=${page} is already present with us try different ones.`,
        });
    }
    try {
        const response = await axios.get(
            "https://api.stackexchange.com/2.3/questions?page=" +
            page +
            "&site=stackoverflow"
        );
        data = response.data;
    } catch (error) {
        console.error("Error fetching data:", error);
    }
    try {
        for (let i = 0; i < data["items"].length; i++) {
            await Question.create({
                page_no: await getPage_no(),
                data: data["items"][i],
            });
        }
    } catch (error) {
        console.log(error);
    }
    return res.send({
        message: `Your requested page=${page} is pushed to your DB.`,
    });
});

app.get("/questions", async (req, res) => {
    const is_answered = req.query.is_answered;
    const tags = req.query.tags;
    const answers_count = req.query.answers_count;
    const answers_count__gt = req.query.answers_count__gt;
    const answers_count__lt = req.query.answers_count__lt;
    const answers_count__gte = req.query.answers_count__gte;
    const answers_count__lte = req.query.answers_count__lte;
    const sort = req.query.sort;
    let page = req.query.page;

    if (
        (answers_count__gt && answers_count__gte) ||
        (answers_count__gt && answers_count__gte)
    ) {
        return res.status(400).json({
            message: `Please enter a valid request`,
        });
    }

    let query = {};
    if (is_answered) {
        query["data.is_answered"] = is_answered === "true";
    }
    if (tags) {
        query["data.tags"] = {
            $in: tags.split(",")
        };
    }
    if (answers_count) {
        query["data.answer_count"] = parseInt(answers_count);
    }
    if (answers_count__gt) {
        query["data.answer_count"] = {
            $gt: parseInt(answers_count__gt),
        };
    }
    if (answers_count__lt) {
        query["data.answer_count"] = {
            ...query["data.answer_count"],
            $lt: parseInt(answers_count__lt),
        };
    }
    if (answers_count__gte) {
        query["data.answer_count"] = {
            ...query["data.answer_count"],
            $gte: parseInt(answers_count__gte),
        };
    }
    if (answers_count__lte) {
        query["data.answer_count"] = {
            ...query["data.answer_count"],
            $lte: parseInt(answers_count__lte),
        };
    }
    let sortOptions = {};
    if (sort === "score") {
        sortOptions["data.score"] = -1;
    } else if (sort === "created_at") {
        sortOptions["data.creation_date"] = -1;
    } else {
        sortOptions["page_no"] = 1;
    }
    const pageSize = 30;
    if (!page) {
        page = 1;
    }
    const skip = (page - 1) * pageSize;
    console.log(skip);

    let allDala;

    console.log(query);
    if (Object.keys(query).length === 0) {
        try {
            allDala = await Question.find({})
                .sort(sortOptions)
                .skip(skip)
                .limit(pageSize);
        } catch (e) {
            console.log(e);
        }
    } else {
        try {
            allDala = await Question.find(query)
                .sort(sortOptions)
                .skip(skip)
                .limit(pageSize);
        } catch (e) {
            console.log(e);
        }
    }
    return res.send(allDala);
});

app.get("/questions/:id", async (req, res) => {
    const Id = req.params.id;

    const ques = await Question.find({
        _id: Id,
    });
    res.json(ques);
});

app.post("/questions", async (req, res) => {
    const body = req.body;

    created = await Question.create({
        page_no: await getPage_no(),
        data: body,
    });
    res.send(`Successfully created with Id ${created._id}`);
});

app.patch("/questions/:id", async (req, res) => {
    const Id = req.params.id;
    const body = req.body;
    try {
        const ques = await Question.findById(Id);

        if (!ques) {
            return res.status(404).json({ message: 'Question not found' });
        }
        
        for (const key in body) {
            if (key.startsWith('data.')) {
                updateNestedField(ques, key, body[key]);
            } else {
                ques[key] = body[key];
            }
        }
        
        const updated = await ques.save();
        res.json(updated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.delete("/questions/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const Deleted = await Question.findByIdAndDelete(id);
        if (!Deleted) {
            return res.status(404).json({
                message: "Given Id not found"
            });
        }
        res.json({
            message: "Deleted successfully",
            Deleted
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
});

function updateNestedField(obj, path, value) {
    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
            current[keys[i]] = {};
        }
        current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
}

app.listen(port, () => {
    console.log(`listening on port ${port}`);
});