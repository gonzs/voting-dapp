App = {
  web3Provider: null,
  contracts: {},
  account: "0x0",

  init: function () {
    return App.initWeb3();
  },

  initWeb3: async function () {
    if (typeof web3 !== "undefined") {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = ethereum;
      web3 = new Web3(ethereum);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider(
        "http://127.0.0.1:8545"
      );
      web3 = new Web3(App.web3Provider);
    }
    // console.log(window.ethereum.send('eth_requestAccounts'));
    return App.initContract();
  },

  initContract: function () {
    $.getJSON("Election.json", function (election) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Election = TruffleContract(election);
      // Connect provider to interact with contract
      App.contracts.Election.setProvider(App.web3Provider);

      // Event listener
      App.listenForEvents();

      return App.render();
    });
  },

  castVote: function () {
    const candidateId = $("#candidatesSelect").val();
    App.contracts.Election.deployed()
      .then(function (instance) {
        return instance.vote(candidateId, { from: App.account });
      })
      .then(function (result) {
        // Wait for votes to update
        $("#content").hide();
        $("#loader").show();
      })
      .catch(function (err) {
        console.error(err);
      });
  },

  listenForEvents: function () {
    App.contracts.Election.deployed().then(function (instance) {
      instance
        .votedEvent(
          {},
          {
            fromBlock: 0,
            toBlock: "latest",
          }
        )
        .watch(function (error, event) {
          console.log("event triggered", event);
          // Reload when a new vote is recorded
          App.render();
        });
    });
  },

  render: function () {
    let electionInstance;
    const loader = $("#loader");
    const content = $("#content");

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase(function (err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html(`Your Account: ${account}`);
      }
    });

    // Load contract data
    App.contracts.Election.deployed()
      .then(function (instance) {
        electionInstance = instance;
        return electionInstance.candidatesCount();
      })
      .then(function (candidatesCount) {
        const candidatesResults = $("#candidatesResults");
        candidatesResults.empty();

        const candidatesSelect = $("#candidatesSelect");
        candidatesSelect.empty();

        for (let i = 1; i <= candidatesCount; i++) {
          electionInstance.candidates(i).then(function (candidate) {
            const id = candidate[0];
            const name = candidate[1];
            const voteCount = candidate[2];

            // Render candidate Result
            const candidateTemplate = `<tr><th> ${id} </th><td> ${name} </td><td> ${voteCount} </td></tr>`;
            candidatesResults.append(candidateTemplate);

            // Render candidate ballot option
            const candidateOption = `<option value='${id}'>${name}</ option>`;
            candidatesSelect.append(candidateOption);
          });
        }
        return electionInstance.voters(App.account);
      })
      .then(function (hasVoted) {
        // Do not allow a user to vote
        if (hasVoted) {
          $("form").hide();
        }
        loader.hide();
        content.show();
      })
      .catch(function (error) {
        console.warn(error);
      });
  },
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
