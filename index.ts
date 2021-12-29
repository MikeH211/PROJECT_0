import { ClientSideMetrics } from '@azure/cosmos';
import express from 'express';
import ClientDAO, { ClientDaoAzure } from './daos/client-dao';
import { Client , Account} from './entities/client';
import errorHandler from "./error-handles";

//Setting a variable to use express package
const app = express();
app.use(express.json());


const clientDao: ClientDAO = new ClientDaoAzure();

// Enpoint number 1
app.post("/clients", async (req,res)=>{
    const client: Client = req.body;
    const savedClient = await clientDao.addClient(client)
    res.status(201)
    res.send(savedClient)      
});

//endpoint number 2
app.get('/clients', async (req,res)=>{
    const clients: Client[] = await clientDao.getAllClients();
    res.status(200)
    res.send(clients)
});

//endpoint number 3
app.get('/clients/:id', async(req,res)=>{
    try{
    const {id} = req.params;
    const client: Client = await clientDao.getClientById(id);
    res.send(client);
    }catch (error){
        errorHandler(error,req,res)

    }
});

// Endpoint number 4
app.put('/clients/:id', async (req,res)=>{
    try{
    const client: Client = req.body;
    const updatedClient: Client = await clientDao.updateClient(client);
        res.send("Update was successful id: " + updatedClient.id)
    }catch(error){
        errorHandler(error,req,res)

    }
    
});

// Endpoint number 5 (status 404 not working)
app.delete('/clients/:id',async (req,res)=>{
    try{
    const {id} = req.params;
    const deleteClient: Client = await clientDao.deleteClientById(id);
    res.status(205)
    res.send("Deleted the client successfully id: " + deleteClient.id);
    } catch (error){
        errorHandler(error,req,res)

    }
    
});

// End point number 6
app.post('/clients/:id/account', async(req,res)=> {
    const{id} = req.params;
    const account: Account = req.body;
    await clientDao.addAccountToClient(id,account)
    res.status(201)
    res.send(account)
})

//Endpoint number 7(couldnt send 404)
app.get('/clients/:id/accounts', async (req,res) => {
    try{
    let query = require('url').parse(req.url,true).query;
    const {id} = req.params;
    const amountLessThan: number = query.amountLessThan
    const amountGreaterThan: number = query.amountGreaterThan
    const accounts: Account[] = await clientDao.getAllAccountsByClientId(id)
    for(let i = 0; i<accounts.length;i++){
        if((accounts[i].balance) < amountLessThan && (accounts[i].balance) > amountGreaterThan){
            res.send(accounts[i])
        }
    }
            res.send(accounts)
    }catch(error){
    errorHandler(error,req,res)
}
})

//9
app.patch('/clients/:id/accounts/:acctType/deposit', async (req, res) =>{
    try{
    const amount1 = req.body;
    const {id, acctType} = req.params;
    const client: Client = await clientDao.getClientById(id)
    for(let i = 0; i < client.accounts.length; i++){
        if(client.accounts[i].type == acctType){
            client.accounts[i].balance += Number(amount1.amount);
        }
    }
    clientDao.updateClient(client);
    res.send("client patch successfully");
    }catch(error){
        errorHandler(error,req,res)
    }
    })

//Endpoint number 10
app.patch('/clients/:id/accounts/:acctType/withdraw', async (req, res) =>{
    try{
    const amount1 = req.body;
    const {id, acctType} = req.params;
    const client: Client = await clientDao.getClientById(id)
    for(let i = 0; i < client.accounts.length; i++){
        if(client.accounts[i].type == acctType){
            client.accounts[i].balance -= Number(amount1.amount);
            if(client.accounts[i].balance<0){
                res.status(422)
            }
        }
    }
    clientDao.updateClient(client);
    res.send("client patch successfully");
    }catch(error){
        errorHandler(error,req,res)
    }
})

app.listen(3000, ()=> console.log("Application started"))







