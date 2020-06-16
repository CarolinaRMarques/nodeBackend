const express = require("express");
const bodyParser = require("body-parser");
const engines = require("consolidate");
const paypal = require("paypal-rest-sdk");

const app = express();

let price = "0";
let cart = [];
let itemsPaypal = [];

app.engine("ejs", engines.ejs);
app.set("views", "./views");
app.set("view engine", "ejs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

paypal.configure({
    mode: "sandbox", //sandbox or live
    client_id:
        "AerEIstjo0S_5RdtWo8Fn-JCfMf01j66dffIM5VnPH2mDYgZD5B1hyEvS4WyJ36yebhqZi1UylwDn1qc",
    client_secret:
        "EH1wcUPoqQ-Z2KcdjytCOJ600aMb62VnoD2c1FRa6WCPD7k5RhoCO72rqJiM-9C6XHnYsKHr8rQT3HVS"
});

app.get("/", (req, res) => {
    res.render("index");
});

const processsItems = (cart) => {
    //console.log(cart);
    for( const i of cart ) {
        itemsPaypal.push({
            name: i.Nome,
            price: i.PrecoBase,
            currency: "EUR",
            quantity: 1
        })
    }

    console.log(itemsPaypal);
    

}

app.post("/data", (req, res, next) => {
    itemsPaypal = [];
    cart = req.body.cart;
    processsItems(JSON.parse(cart));
    price = req.body.price;
    res.json("Received Data");
});

app.get("/paypal", (req, res) => {
    console.log(price)
    var create_payment_json = {
        intent: "sale",
        payer: {
            payment_method: "paypal"
        },
        redirect_urls: {
            return_url: "http://10.0.3.2:3000/success",
            cancel_url: "http://10.0.3.2:3000/cancel"
        },
        transactions: [
            {
                item_list: {
                    items: itemsPaypal
                },
                amount: {
                    currency: "EUR",
                    total: price
                },
                description: "Compra Bar DEGEIT, UA."
            }
        ]
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            console.log("Create Payment Response");
            console.log(payment);
            res.redirect(payment.links[1].href);
        }
    });
});

app.get("/success", (req, res) => {
    // res.send("Success");
    var PayerID = req.query.PayerID;
    var paymentId = req.query.paymentId;
    var execute_payment_json = {
        payer_id: PayerID,
        transactions: [
            {
                amount: {
                    currency: "EUR",
                    total: price
                }
            }
        ]
    };

    paypal.payment.execute(paymentId, execute_payment_json, function (
        error,
        payment
    ) {
        if (error) {
            console.log(error.response);
            itemsPaypal = [];
            throw error;
            
        } else {
            console.log("Get Payment Response");
            console.log(JSON.stringify(payment));
            itemsPaypal = [];
            res.render("success");
        }
    });
});

app.get("cancel", (req, res) => {
    res.render("cancel");
});

app.listen(3000, () => {
    console.log("Server is running");
});
