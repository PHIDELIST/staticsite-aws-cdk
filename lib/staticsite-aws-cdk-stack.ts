import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as cloudfront_origin from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';


export class StaticsiteAwsCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    //create new s3 bucket
    const siteBucket = new s3.Bucket(this, 'delphi254', {
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'error.html',
      publicReadAccess: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
     
      cors: [
        {
          allowedMethods: [s3.HttpMethods.GET],
          allowedOrigins: ['distribution.distributionDomainName'],
          allowedHeaders: ['*'],
         
         }]
})
    //grant read access to the bucket
    siteBucket.grantPublicAccess('*', 's3:GetObject');
 
    //Cloudfront distribution
    const distribution = new cloudfront.Distribution(this, 'delphi254-distribution', {
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: new cloudfront_origin.S3Origin(siteBucket),
        compress: true,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      }
    });

    //Deploy to S3
    new s3deploy.BucketDeployment(this, 'delphi254-deploy', {
      sources: [s3deploy.Source.asset('./staticSite')],
      destinationBucket: siteBucket,
      distribution,
      distributionPaths: ['/*'],
    });

    //Outputs
    new cdk.CfnOutput(this, 'WebsiteURL', {
      value: distribution.distributionDomainName,});
      

}
}
