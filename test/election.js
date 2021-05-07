const Election = artifacts.require("./Election.sol");

contract("Election", function (accounts) {
  let electionInstance;

  it("Initializes with two candidates", function () {
    return Election.deployed()
      .then(function (instance) {
        return instance.candidatesCount();
      })
      .then(function (count) {
        assert.equal(count, 2);
      });
  });

  it("Initializes the candidates with the correct values", function () {
    return Election.deployed()
      .then(function (instance) {
        electionInstance = instance;
        return electionInstance.candidates(1);
      })
      .then(function (candidate) {
        assert.equal(candidate[0], 1, "Contains the correct id");
        assert.equal(candidate[1], "Candidate-1", "Contains the correct name");
        assert.equal(candidate[2], 0, "Contains the correct votes count");
        return electionInstance.candidates(2);
      })
      .then(function (candidate) {
        assert.equal(candidate[0], 2, "Contains the correct id");
        assert.equal(candidate[1], "Candidate-2", "Contains the correct name");
        assert.equal(candidate[2], 0, "Contains the correct votes count");
      });
  });

  it("Allows a voter to cast a vote for candidate-1", function () {
    return Election.deployed()
      .then(function (instance) {
        electionInstance = instance;
        candidateId = 1;
        return electionInstance.vote(candidateId, { from: accounts[0] });
      })
      .then(function (receipt) {
        assert.equal(receipt.logs.length, 1, "An event was triggered");
        assert.equal(
          receipt.logs[0].event,
          "votedEvent",
          "The event type is correct"
        );
        assert.equal(
          receipt.logs[0].args._candidateId.toNumber(),
          candidateId,
          "The candidate id is correct"
        );
        return electionInstance.voters(accounts[0]);
      })
      .then(function (voted) {
        assert(voted, "The voter was marked as voted");
        return electionInstance.candidates(candidateId);
      })
      .then(function (candidate) {
        const voteCount = candidate[2];
        assert.equal(voteCount, 1, "Increments the candidate's vote count");
      });
  });

  it("Throws an exception for invalid candidates vote", function () {
    return Election.deployed()
      .then(function (instance) {
        electionInstance = instance;
        return electionInstance.vote(99, { from: accounts[1] });
      })
      .then(assert.fail)
      .catch(function (error) {
        assert(
          error.message.indexOf("revert") >= 0,
          "Error message must contain revert"
        );
        return electionInstance.candidates(1);
      })
      .then(function (candidate1) {
        const voteCount = candidate1[2];
        assert.equal(
          voteCount,
          1,
          "Candidate 1 did not receive any votes (1 vote)"
        );
        return electionInstance.candidates(2);
      })
      .then(function (candidate2) {
        const voteCount = candidate2[2];
        assert.equal(
          voteCount,
          0,
          "Candidate 2 did not receive any votes (0 votes)"
        );
      });
  });

  it("Throws an exception for double voting for candidate-2", function () {
    return Election.deployed()
      .then(function (instance) {
        electionInstance = instance;
        candidateId = 2;
        electionInstance.vote(candidateId, { from: accounts[1] });
        return electionInstance.candidates(candidateId);
      })
      .then(function (candidate) {
        const voteCount = candidate[2];
        assert.equal(voteCount, 1, "Accepts first vote");

        // Try to vote again
        return electionInstance.vote(candidateId, { from: accounts[1] });
      })
      .then(assert.fail)
      .catch(function (error) {
        assert(
          error.message.indexOf("revert") >= 0,
          "Error message must contain revert"
        );
        return electionInstance.candidates(1);
      })
      .then(function (candidate1) {
        const voteCount = candidate1[2];
        assert.equal(
          voteCount,
          1,
          "Candidate 1 did not receive any votes (1 vote)"
        );
        return electionInstance.candidates(2);
      })
      .then(function (candidate2) {
        const voteCount = candidate2[2];
        assert.equal(
          voteCount,
          1,
          "Candidate 2 did not receive any votes (1 vote)"
        );
      });
  });
});
