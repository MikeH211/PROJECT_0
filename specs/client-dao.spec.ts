import ClientDAO, { ClientDaoAzure } from "../daos/client-dao";
import { Client, Account } from "../entities/client";

describe ("Client Dao Tests", ()=>{

    const clientDao: ClientDAO = new ClientDaoAzure();
    let savedClient:Client = null;
    

    it("Should create a client", async ()=>{
        const client: Client = {fname:"Bobby", lname:"Sprucy", id:'', accounts:[{type:"checking",balance:400}]}
        savedClient = await clientDao.createClient(client);
        expect (savedClient.id).not.toBeFalsy();
    });
    
    it("Should get a client by ID", async ()=>{
        const retrievedClient: Client = await clientDao.getClientById(savedClient.id);
        expect(retrievedClient.fname).toBe("Bobby");
        expect(retrievedClient.lname).toBe("Sprucy");
    });

    it("Should update a client", async () => {
        const updatedClient: Client = {fname:"Hansel", lname:"Platt", id: savedClient.id, accounts:[{type:"vacationfund",balance:3200}]}
        await clientDao.updateClient(updatedClient);
        const retrivedClient: Client = await clientDao.getClientById(updatedClient.id);
        expect(retrivedClient.fname).toBe("Hansel")
    })

  

    it("Should get all clients", async () => {
        const retrievedClients: Client[] = await clientDao.getAllClients();
        expect(retrievedClients).toBeDefined;
    })
    
    it("Should add a client", async () => {
        const client: Client = {fname:"Stewart", lname:"Price", id:'', accounts:[{type:"checking",balance:688}]}
        savedClient = await clientDao.addClient(client);
        expect (savedClient.id).not.toBeFalsy();

    })

     it("Get all Accounts by Client ID", async () => {
        const retrievedAccounts: Account[] = await clientDao.getAllAccountsByClientId(savedClient.id);
        expect(retrievedAccounts).toBeDefined;
        
    })

    it("Add Account to Client", async () => {
        // const client: Client = {fname:"Stan", lname:"tree", id:'', accounts:[{type:"checking",balance:688}]}
        const account: Account = {type:"checking",balance:688}
        savedClient = await clientDao.addAccountToClient(savedClient.id, account);
        expect(savedClient.accounts.length).toBe(2);
        
    })

    it("should delete a client", async () => {
        await clientDao.deleteClientById(savedClient.id)
        expect(async ()=> {
            await clientDao.getClientById(savedClient.id)
        }).toBeDefined;
    })

})