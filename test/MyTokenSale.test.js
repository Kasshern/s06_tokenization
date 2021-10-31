const Token = artifacts.require("MyToken");
const TokenSale = artifacts.require("MyTokenSale");
const KycContract = artifacts.require("KycContract");

const chai = require("./chaisetup.js");
const BN = web3.utils.BN;
const expect = chai.expect;
contract("TokenSale", async function(accounts) {
    const [initialHolder, recepient, anotherAccount] = accounts;

    it("there shouldn't be any coins in my account", async () => {
        let instance = await Token.deployed();
        return expect(instance.balanceOf.call(initialHolder)).to.eventually.be.a.bignumber.equal(new BN(0));
    })

    it("all coins should be in the tokensale smart contract", async () => {
        let instance = await Token.deployed();
        let balance = await instance.balanceOf.call(TokenSale.address);
        let totalSupply = await instance.totalSupply.call();
        return expect(balance).to.be.a.bignumber.equal(totalSupply);
    })

    it("should be possible to buy one token by simple sending ether to smart contract", async () => {
        let tokenInstance = await Token.deployed();
        let tokenSaleInstance = await TokenSale.deployed();
        let balanceBeforeAccount = await tokenInstance.balanceOf.call(recepient);
        await expect(tokenInstance.sendTransaction({from: recepient, value: web3.utils.toWei("1", "Wei")})).to.be.rejected;
        expect(balanceBeforeAccount).to.be.a.bignumber.equal(await tokenInstance.balanceOf.call(recepient));

        let KycInstance = await KycContract.deployed();
        await KycInstance.setKycCompleted(recepient);
        await expect(tokenSaleInstance.sendTransaction({from: recepient, value: web3.utils.toWei("1", "wei")})).to.be.fulfilled;
        return expect(balanceBeforeAccount + 1).to.be.a.bignumber.equal(await tokenInstance.balanceOf.call(recepient)) ;
    })
})