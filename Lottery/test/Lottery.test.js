const assert =require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3'); //constructore of web3 in caps
const web3 = new Web3(ganache.provider());//instance 
const { interface, bytecode }=require('../compile');


let accounts;
let lottery;



beforeEach( async()=> {
    //get a list of all accounts
     accounts = await web3.eth.getAccounts()
    // .then(fetchedAccounts => {
    //     console.log(fetchedAccounts);
    // });

    //use one the accounts to deploy the contract

  lottery = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode })
    .send({ from: accounts[0],gas: '1000000' });
}

);

describe("Lottery Contract", () => {
    it('deploycontract',()=> {
        assert.ok(lottery.options.address);

    });

    it('entering contract ', async () => {
        await lottery.methods.enter().send( { 
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether')
        });
       
        const players =await lottery.methods.getPlayers().call( {
            from: accounts[0]
        }); 

        assert.equal(accounts[0], players[0]);
        assert.equal(1, players.length);
    });

    // it('entering multiple accounts ', async () => {
    //     await lottery.methods.enter().send( { 
    //         from: accounts[0],
    //         value: web3.utils.toWei('0.02', 'ether')
    //     });
       
    //     const players =await lottery.methods.getPlayers().call( {
    //         from: accounts[0]
    //     }); 

    //     assert.equal(accounts[0], players[0]);
    //     assert.equal(1, players.length);
    // });

    it('requires minimum ether as entry fee', async() => {
        try{
            await lottery.methods.enter().send({
                from: accounts[0],
                value: 0
            });
            assert(false);
        }catch ( err) {
            assert(err);
        }
    });


    it('manager calls pickWinner', async() => {
        try {
            await lottery.methods.pickWinner().send({
                from: accounts[1]
            });
            assert(false);
        } catch (err) {
            assert(err);
        }
    })

    it(' finishes lottery and renews it' , async() => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('2','ether')
        });

        const intialBalance = await web3.eth.getBalance(accounts[0]);

        await lottery.methods.pickWinner().send({ from: accounts[0] });

        const finalBalance = await web3.eth.getBalance(accounts[0]);

        const differnce = finalBalance - intialBalance ;
        console.log(finalBalance - intialBalance);
        assert( differnce > web3.utils.toWei('1.8', 'ether'));
    });
    


});