
import {Client, Account} from "../entities/client";
import {v4} from 'uuid';
import { CosmosClient } from "@azure/cosmos";
import { ResourceNotFoundError } from "../error-handles";

const client1 = new CosmosClient(process.env.COSMOS_CONNECTION);
const database = client1.database('banking-db'); 
const container = database.container('Clients'); 


export default interface ClientDAO{
    
    createClient(client: Client): Promise<Client>;
    addClient(client: Client): Promise<Client>;
    addAccountToClient(clientId:string, acct: Account): Promise<Client>;

    getAllClients(): Promise<Client[]>;
    getClientById(id: string): Promise<Client>;
    getAllAccountsByClientId(id: string): Promise<Account[]>;

    updateClient(client: Client): Promise<Client>;
    
    deleteClientById(id: string): Promise<Client>;
}

export class ClientDaoAzure implements ClientDAO{
    
    async addAccountToClient(clientId: string, acct: Account): Promise<Client> {
        const client: Client = await this.getClientById(clientId)
        //const accounts: Account[] = await this.getAllAccountsByClientId(clientId)
        client.accounts.push(acct)
        await this.updateClient(client)
        return client
    }
    async addClient(client: Client): Promise<Client> {
        client.accounts = client.accounts ?? [];
        client = await this.createClient(client);
        return client;
    }
   
    async createClient(client: Client): Promise<Client> {
        client.id = v4();
        const response = await container.items.create(client);
        return response.resource
    }
    
    async getAllClients(): Promise<Client[]> {
        const response = await container.items.readAll<Client>().fetchAll();
        return response.resources
    }
    
    async getClientById(id: string): Promise<Client> {
        const clients: Client[] = await this.getAllClients();
        const client: Client | undefined = clients.find(a => a.id === id);
        if(!client){
            throw new ResourceNotFoundError(`The resource with ${id} was not found`)
        }
        return client;
    }
    
    async getAllAccountsByClientId(id: string): Promise<Account[]> {
        const client = await this.getClientById(id);
        const accounts: Account[] = client.accounts;
        return accounts;
    }
    
    async updateClient(client: Client): Promise<Client> {
        await this.getClientById(client.id)
        const response = await container.items.upsert<Client>(client);
        return response.resource
    }
    
    async deleteClientById(id: string): Promise<Client> {
        const client = await this.getClientById(id)
        const response = await container.item(id,id).delete();
        return client;
    }
}