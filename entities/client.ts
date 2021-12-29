
export interface Account{
    type: string
    balance: number
}

export interface Client{
    id: string
    fname: string
    lname: string
    accounts: Account[]
}

