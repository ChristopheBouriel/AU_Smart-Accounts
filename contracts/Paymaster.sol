// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@account-abstraction/contracts/interfaces/IPaymaster.sol";

contract Paymaster is IPaymaster {
    function validatePaymasterUserOp(UserOperation calldata, bytes32, uint256)
        external
        pure
        returns (bytes memory context, uint256 validationData){
            context = new bytes(0);
            // userOp.paymasterAndData()
            // (paymaster part) 20 bytes : paymaster address
            // (AndData part) : could be almost anything we want... Most of the time we'll have :
            // - a timePeriod (during which the paymaster is willing to pay for gas)
            // - signature of the paymaster
            // But for now we just want to validate as below
            validationData = 0; // special value indicating that the signature is valid and we're willing to spend the gas for this user operation
    }

    /**
     * post-operation handler.
     * Must verify sender is the entryPoint
     * @param mode enum with the following options:
     *      opSucceeded - user operation succeeded.
     *      opReverted  - user op reverted. still has to pay for gas.
     *      postOpReverted - user op succeeded, but caused postOp (in mode=opSucceeded) to revert.
     *                       Now this is the 2nd call, after user's op was deliberately reverted.
     * @param context - the context value returned by validatePaymasterUserOp
     * @param actualGasCost - actual gas used so far (without this postOp call).
     */
    function postOp(PostOpMode mode, bytes calldata context, uint256 actualGasCost) external{}
}
