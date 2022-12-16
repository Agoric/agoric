# An Attacker's guide to Agoric Governance

This is an incomplete list of potential weak points that an attacker might
want to focus on when looking for ways to violate the integrity of the
governance system. It's here to help defenders, as "attacker's mindset" is a
good way to focus attention for the defender. The list should correspond
pretty closely to the set of assurances that the governance system aims to
support.

I see three main kinds of threats here:

- bugs or oversights in the infrastructure
- attacks on voters
- mistakes that might arise in governed contracts

The first two can be mitigated by validation functions that cross-check linkages.

I'm not as sure how to address the third, except better documentation, and
support for custom validation functions.

## Get a voter facet you shouldn't have

Every module that handles voter facets should handle them carefully and ensure
they don't escape. If you can get access to a voter facet (or the main voteCap
for a VoteCounter), you can cast a ballot and override the preferences of the
rightful voter. If you can manufacture voter facets that are accepted, you can
stuff the ballot box.

## Get a voteCounter to accept votes from a single voter without replacement

I can't think of a way to evade the way BinaryVoteCounter ensures that each
vote is only counted once, but it's something to be aware of with new
VoteCounters, and particularly in combination with new Electorates.

## Break notification so voters don't hear about elections

This would be a minor issue, but the notifications are the only mechanism we
provided for announcing new issues.

## Leak the ability to create new questions

Currently creating new questions is seen as tightly held. If that is loosened
in a new Electorate or ElectionManager, that provides a path for spamming
voters.

## What shenanigans can be caused by creating multiple questions with the same or very similar text?

The question text used to be unique, but each question now has a
questionHandle for disambiguation. Voters ought to validate the particulars of
any question they intend to vote on. Can they be confused by corrections or
replacement? Is there a vulnerability here, or just a UI support need?

## Create a Question that refers to a different VoteCounter than the one the electorate will use

## Distribute questions that don't match the official one from the Electorate

Questions themselves are not secure. The voter has to get a copy of the question
from the Electorate to have any assurance that it's valid. If someone else
provides a question, they can replace various pieces to fool the voter as to
what is being voted on or how the votes will be tallied.

## Ordinary bugs in counting votes, reporting, etc.

If the code in VoteCounter, Electorate, ContractGovernor has subtle mistakes,
wrong results will obtain.

## Produce a discrepancy between Terms and actions in VoteCounter or Electorate

The voter's assurance that a particular vote has the effect they expect
arises in part because the `terms` in the VoteCounter, Electorate,
etc. dictate how those classes will act. If the code is changed to get info
from hidden parameters or to ignore some of the terms, voters will be misled.

## Use a timer that is controlled by a party to the vote

Everyone involved relies on the timers used to close voting being platform
timers, but timers aren't self-revealing. Participants should compare the
timers to known platform-provided timers before relying on them.
[A related bug has been filed](https://github.com/Agoric/agoric-sdk/issues/3748)

## Electorate allow unauthorized parties to cast votes

Every electorate will have some notion of who the authorized voters are. They
need to properly enforce that each voter can vote their weight once. The
initial implementation (Committee) supports equal weight votes and
known voters. Future Electorates and VoteCounters will support other models.
The combination of open-entry stake-holder votes with variable weight
voteCounters will require even more diligence to ensure there are no avenues
for multiply counting votes.

## Electorate accidentally re-use a voteCounter

Each voteCounter is intended to be used once. If there's a path that allows
re-use, this would be a hazard.

## Does failed question creation throw detectably?

When creating new questions, there is a lot of checking for valid combinations
of parameters. Automated question creators need to be able to detect failures,
so they don't assume success when they shouldn't.

## Does submission of an incorrect ballot throw detectably?

Similarly, if voters construct their votes incorrectly, they need a way to
detect that something went wrong.

## Some vote outcome doesn't update notifiers correctly

There are a couple of paths (quorum-counting, tie detection, the count itself)
after a vote is closed before the outcome is declared. If something goes
wrong, that needs to be detected and an appropriate outcome signalled.

## Timing attacks on parameter updates or vote outcomes

This is a vague idea. How bad would it be if there were a timing race to update
a single parameter? This falls more along the lines of confusing the electorate
than a weakness in the protocols or infrastructure.

## Get contractGovernor to leak paramManager private facet

The contractGovernor needs to ensure that the facet for calling `updateFoo()`
for a particular paramManager is only available in a visible way, but the code
there is delicate. Is there a way to hijack the facet that wouldn't be
detectable to voters or onlookers?

## Create question that claims to govern a contract it doesn't have control over

It's possible to insert a layer between the contractGovernor and the
paramManager or governedContract that allows external control of the
parameters. Is there a way to do so that wouldn't be detected by the
validators we've provided? The double linkage between governedContract and
contractGovernor is supposed to ensure that an inserted layer would be
obvious. Is there a way to evade that detection?

## Other Discrepancy between governedContract and ContractGovernor

Are there ways to write governedContracts so they appear to be handled by
contractGovernor, but other intervention in the update parameters calls is
possible?

## Can a cheating governor start up a contract with an invisible wrapper undetectably?

If someone wrote a variant contractGovernor, how hard would it be to tell
whether they had missed some of these checks?

## Get a contract to install ParamManager incorrectly, so ContractGovernor can't update values

## Write a contract that configures ParamManager incorrectly so some params are broken

## Write the update responder incorrectly so intended action in response to votes don't occur

## Contract has additional restrictions on parameter value, so value update fails after vote passes

These effectively count as contract bugs. If the contract is written so that
some contract updates would cause it to be inoperable, then it's incumbent on
the operators to ensure that those parameter values aren't proposed unless the
goal is shutdown.

## Contracts that don't use ContractHelper have to be more careful

There are methods they are required to provide, and they need to treat the
paramManager delicately. If there are invitations among the parameters, they
could access the invitation rather than the amount.

## Electorates can change a contract's electorate

Can an Electorate replace itself with something that doesn't have legibility?
