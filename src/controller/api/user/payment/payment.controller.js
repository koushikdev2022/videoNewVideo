const {Transaction,Wallet,User,Plan,UserAddress} = require("../../../../models")
const Stripe = require('stripe');

const path = require('path');
const ejs = require('ejs');
const { mailCogfig } = require('../../../../config/mailConfig');

exports.initiate = async(req,res)=>{
    try{
      const payload = req?.body
      const userId = req?.user?.id
      const  planDetails = await Plan.findByPk(payload?.plan_id)
      const addressId = req?.body?.address_id || 0 
      const transactionCreate = await Transaction.create({
           user_id:userId,
           plan_id:payload?.plan_id,
           total_balance:planDetails?.price,
           transaction_type:"credit",
           transaction_success:"initiate",
           address_id:addressId,
           total_credit:planDetails?.credit,
      })
      if(transactionCreate?.id>0){
        res.status(201).json({
            messsage:"create successfully",
            status:true,
            data:transactionCreate,
            status_code:201,
        })
      }else{
        res.status(400).json({
            messsage:"creation failed",
            status:false,
            status_code:400,
        })
      }
    }catch (err) {
        console.log("Error in login authController: ", err);
        const status = err?.status || 400;
        const msg = err?.message || "Internal Server Error";
        return res.status(status).json({
            msg,
            status: false,
            status_code: status
        })
    }
      
}


exports.stripePaymentIntent = async(req,res)=>{
    try{
        const payload = req?.body
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        const planDetails = await Plan.findByPk(payload?.plan_id)
        const amount = (planDetails?.price) * 100
        const currency = planDetails?.currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount, 
            currency, 
            payment_method_types: ['card'], 
        });
        const transactionData = await Transaction.findByPk(payload?.transaction_id)
        const update = transactionData.update({
            payment_intend:paymentIntent.id,
            transaction_success:"pending",
        })
        res.status(201).json({
            status:true,
            clientSecret: paymentIntent.client_secret, 
            status_code:201,
            message:"payment intent created"
        });
    }catch (err) {
        console.log("Error in login authController: ", err);
        const status = err?.status || 400;
        const msg = err?.message || "Internal Server Error";
        return res.status(status).json({
            msg,
            status: false,
            status_code: status
        })
    }
}


exports.walletUpdate = async(req,res) =>{
    try{
          const payload = req?.body;
          const user_id = req?.user?.id;
          let queryStatus = false;
          const userDetails = await User.findByPk(user_id)
          const transactionDetails = await Transaction.findByPk(payload?.transaction_id);
          const planDetails = await Plan.findByPk(payload?.plan_id)
          const userWallet = await Wallet.findOne({
            where:{
                user_id:user_id
            }
          })
          if(!userWallet){
             const create = await Wallet.create({
                user_id:user_id,
                balance:planDetails?.credit,
                account_freeze:0,
                is_free:0,
                is_active:0
             })
             if(create.id > 0){
                queryStatus=true
             }else{
                queryStatus=false
             }
          }else{
            let newBalance
            if(userWallet?.is_free==1){
                console.log("hellow")
                newBalance = planDetails?.credit
            }else{
                console.log("by")
                newBalance = userWallet?.balance + planDetails?.credit
            }
            console.log(newBalance)
            const walletUpdate = await Wallet.update({
                    balance:newBalance,
                    is_free:0
                },{
                    where:{
                        user_id:user_id
                    }
                })
            if(walletUpdate){
                const transporter = await mailCogfig()
                const emailTemplatePath = path.join(__dirname,"../../../../",'templates', 'payment.ejs');
                const emailContent = await ejs.renderFile(emailTemplatePath, {
                    first_name: userDetails?.first_name, 
                    credit:newBalance
                });

                const mailOptions = {
                    from: process.env.SMTP_USER,
                    to: userDetails?.email, 
                    subject: "Welcome to Our Platform!",
                    html: emailContent, 
                };

                
                await transporter.sendMail(mailOptions);
                queryStatus=true
            }else{
                queryStatus=false
            }
          }
          if(queryStatus){
             const updateTransactionDetails = await transactionDetails.update({
                transaction_success:"success"
             })
             if(updateTransactionDetails){
                res.status(200).json({
                    status:true,
                    status_code:200,
                    message:"update payment and wallet"
                });
             }else{
                res.status(400).json({
                    status:false,
                    status_code:400,
                    message:"transaction update failed"
                });
             }
          }else{
                const updateTransactionDetails = await transactionDetails.update({
                    transaction_success:"failed"
                })
                res.status(400).json({
                    status:false,
                    status_code:400,
                    message:"payment deduct but wallet not update please contact to admin"
                });
          }
    }catch (err) {
        console.log("Error in login authController: ", err);
        const status = err?.status || 400;
        const msg = err?.message || "Internal Server Error";
        return res.status(status).json({
            msg,
            status: false,
            status_code: status
        })
    }
}




exports.transactionFailed = async(req,res) =>{
    try{
          const payload = req?.body;
          const user_id = req?.user?.id;
          const transactionDetails = await Transaction.findByPk(payload?.transaction_id);
          const updateTransactionDetails = await transactionDetails.update({
            transaction_success:"failed"
          })
          if(updateTransactionDetails){
            res.status(200).json({
                status:true,
                status_code:200,
                message:"update successfully"
            });
          }else{
            res.status(400).json({
                status:false,
                status_code:400,
                message:"transaction failed"
            });
          }
    }catch (err) {
        console.log("Error in login authController: ", err);
        const status = err?.status || 400;
        const msg = err?.message || "Internal Server Error";
        return res.status(status).json({
            msg,
            status: false,
            status_code: status
        })
    }
}


exports.transactionDetails = async(req,res)=>{
    try{
          const userId = req?.user?.id
          const limit = req?.body?.limit || 10;
          const page = req?.body?.page || 1;
          const offset = (page-1) * limit; 
          let totalPage
          const query = {
              include:[{
                 model:Plan,
                 as:"Plan",
                 required:false
              },{
                model:User,
                as:"User",
                required:false
              },{
                model:UserAddress,
                as:"UserAddress",
                required:false
              }],
              order:[['created_at','desc']],
              where:{},
              limit:limit,
              offset:offset
          }
          query.where.user_id=userId
          const count = await Transaction.count({
            where:query.where,
            distinct: true
          })
          totalPage = Math.ceil(count/limit);
          const findTransaction = await Transaction.findAll(query)
          if (findTransaction) {
            res.status(200).json({
                messsage: "data found",
                status: true,
                status_code: 200,
                total_page:totalPage,
                data: findTransaction,
                data_count: count,
                page: page
            })
        } else {
            res.status(200).json({
                messsage: "no data found",
                status: true,
                status_code: 200,
                data: findTransaction,
                total_page:totalPage,
                data_count: count,
                page: page
            })
        }
    }catch (err) {
        console.log("Error in login authController: ", err);
        const status = err?.status || 400;
        const msg = err?.message || "Internal Server Error";
        return res.status(status).json({
            msg,
            status: false,
            status_code: status
        })
    }
}



exports.wallet = async(req,res)=>{
    try{
          const userId = req?.user?.id
          const query = {
              where:{},
          }
          query.where.user_id=userId
          const findWallet = await Wallet.findAll(query)
          if (findWallet) {
            res.status(200).json({
                messsage: "data found",
                status: true,
                status_code: 200,
                data: findWallet,
            })
        } else {
            res.status(200).json({
                messsage: "no data found",
                status: true,
                status_code: 200,
                data: findWallet,
            })
        }
    }catch (err) {
        console.log("Error in login authController: ", err);
        const status = err?.status || 400;
        const msg = err?.message || "Internal Server Error";
        return res.status(status).json({
            msg,
            status: false,
            status_code: status
        })
    }
}



exports.walletDeduct = async(req,res)=>{
    try{
        const userId = req?.user?.id;
        const userWallet = await Wallet.findOne({
            where:{
                user_id:userId
            }
        })
        if(userWallet){
            const createTransaction = await Transaction.create({
                user_id:userId,
                plan_id:0,
                address_id: 0,
                total_balance:0,
                total_credit: 90,
                payment_intend:"NULL",
                transaction_type:"debit",
                transaction_success:"success"

            })
            console.log(userWallet)
            console.log(userWallet?.balance)
            const newBalance = userWallet?.balance - 90;
            console.log(newBalance)
            const updateWallet = await Wallet.update({
                 balance:newBalance
            },{
                where:{
                    user_id:userId
                }
            })
            if(updateWallet){
                res.status(200).json({
                    message:"deducted",
                    status:true,
                    status_code:200
                })
            }else{
                res.status(400).json({
                    message:"true",
                    status:false,
                    status_code:400
                })
            }
        }else{
            res.status(200).json({
                messsage: "invalid token",
                status: false,
                status_code: 400,
            })
        }
    }catch (err) {
        console.log("Error in login authController: ", err);
        const status = err?.status || 400;
        const msg = err?.message || "Internal Server Error";
        return res.status(status).json({
            msg,
            status: false,
            status_code: status
        })
    }
       
}
exports.walletDeductDynamic = async (req,res)=>{
    try{
        const userId = req?.user?.id;
        const token = req?.body?.token;
        if(!token){
            res.status(422).json({
                status:false,
                status_code:422,
                message:"token required"
            })
        }
        const userWallet = await Wallet.findOne({
            where:{
                user_id:userId
            }
        })
        if(userWallet){
            const createTransaction = await Transaction.create({
                user_id:userId,
                plan_id:0,
                address_id: 0,
                total_balance:0,
                total_credit: token,
                payment_intend:"NULL",
                transaction_type:"debit",
                transaction_success:"success"

            })
            console.log(userWallet)
            console.log(userWallet?.balance)
            const newBalance = userWallet?.balance - token;
            console.log(newBalance)
            const updateWallet = await Wallet.update({
                 balance:newBalance
            },{
                where:{
                    user_id:userId
                }
            })
            if(updateWallet){
                res.status(200).json({
                    message:"deducted",
                    status:true,
                    status_code:200
                })
            }else{
                res.status(400).json({
                    message:"true",
                    status:false,
                    status_code:400
                })
            }
        }else{
            res.status(200).json({
                messsage: "invalid token",
                status: false,
                status_code: 400,
            })
        }
    }catch (err) {
        console.log("Error in login authController: ", err);
        const status = err?.status || 400;
        const msg = err?.message || "Internal Server Error";
        return res.status(status).json({
            msg,
            status: false,
            status_code: status
        })
    }
}