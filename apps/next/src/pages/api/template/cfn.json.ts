import type { NextApiRequest, NextApiResponse } from "next"
import { config } from "~/next/config"

/**
 * Template must live in S3.
 * Uploading the files is not automated.
 *
 * Create 2 json files:
 * 1. template_production
 * 2. template_staging
 * Replace with below JSON and upload to S3.
 * Set the base URL to object in .env (excluding file name path)
 */
export default async function handler(
  _: NextApiRequest,
  res: NextApiResponse<unknown>,
) {
  const lambdaSuffix = config.STAGE === "production" ? "production" : "staging"

  res.json({
    AWSTemplateFormatVersion: "2010-09-09",
    Description:
      "Grant Photonic the ability to manage an S3 bucket on your account securely.",
    Parameters: {
      PhotonicId: {
        Type: "String",
        Description:
          "Do not change this value or the cloudformation stack creation will fail.",
      },
    },
    Resources: {
      PhotonicRole: {
        Type: "AWS::IAM::Role",
        Properties: {
          RoleName: {
            "Fn::Join": [
              "-",
              [
                "PhotonicRole",
                {
                  Ref: "PhotonicId",
                },
              ],
            ],
          },
          AssumeRolePolicyDocument: {
            Version: "2012-10-17",
            Statement: [
              {
                Effect: "Allow",
                Action: "sts:AssumeRole",
                Principal: {
                  AWS: "arn:aws:iam::012467934926:user/@photonic-server-dev",
                },
                Condition: {
                  StringEquals: {
                    "sts:ExternalId": {
                      Ref: "PhotonicId",
                    },
                  },
                },
              },
            ],
          },
          ManagedPolicyArns: ["arn:aws:iam::aws:policy/AmazonS3FullAccess"],
        },
      },
      PhotonicBucket: {
        Type: "AWS::S3::Bucket",
        Properties: {
          AccessControl: "Private",
          BucketName: {
            "Fn::Join": [
              "-",
              [
                "photonicbucket",
                {
                  "Fn::Select": [
                    1,
                    {
                      "Fn::Split": [
                        "_",
                        {
                          Ref: "PhotonicId",
                        },
                      ],
                    },
                  ],
                },
              ],
            ],
          },
          PublicAccessBlockConfiguration: {
            BlockPublicAcls: true,
            BlockPublicPolicy: true,
            IgnorePublicAcls: true,
            RestrictPublicBuckets: true,
          },
        },
      },
      PhotonicPolicy: {
        Type: "AWS::IAM::Policy",
        Properties: {
          PolicyName: "PhotonicPolicy",
          Roles: [
            {
              Ref: "PhotonicRole",
            },
          ],
          PolicyDocument: {
            Version: "2012-10-17",
            Statement: [
              {
                Effect: "Allow",
                Action: "sts:AssumeRole",
                Resource: {
                  "Fn::GetAtt": ["PhotonicRole", "Arn"],
                },
                Condition: {
                  StringEquals: {
                    "sts:ExternalId": {
                      Ref: "PhotonicId",
                    },
                  },
                },
              },
            ],
          },
        },
      },
      ConnectToPhotonic: {
        Type: "Custom::ConnectToPhotonic",
        Properties: {
          ServiceToken: `arn:aws:lambda:eu-central-1:012467934926:function:connect_to_photonic_${lambdaSuffix}`,
          AwsAccountId: {
            Ref: "AWS::AccountId",
          },
          RoleArn: {
            "Fn::GetAtt": ["PhotonicRole", "Arn"],
          },
          ExternalId: {
            Ref: "PhotonicId",
          },
          BucketName: {
            Ref: "PhotonicBucket",
          },
          Region: {
            Ref: "AWS::Region",
          },
        },
      },
    },
  })
}
