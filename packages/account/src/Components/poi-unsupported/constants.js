import { localize } from '@deriv/translations';

export const getDocumentIndex = ({ residence }) => [
    {
        title: localize('Passport'),
        description: localize('Upload the page that contains your photo.'),
        icon: 'IcPoiPassport',
        steps: [
            {
                icon: 'IcPassport',
                title: localize('Upload the page of your passport that contains your photo'),
            },
        ],
    },
    {
        title: localize('Driving licence'),
        description: localize('Upload the front and back of your driving licence.'),
        icon: 'IcPoiDrivingLicence',
        steps: [
            {
                icon: 'IcDrivingLicenceFront',
                title: localize('Upload the front of your driving licence'),
                description: localize('You’ll be asked to upload the back of your driving licence next.'),
                confirm_description: localize(
                    'After confirming, you’ll be asked to upload the back of your driving licence next.'
                ),
            },
            {
                icon: 'IcIdCardBack',
                title: localize('Upload the back of your driving licence'),
            },
        ],
    },
    {
        title: localize('Identity card'),
        description: localize('Upload the front and back of your identity card.'),
        icon: 'IcPoiIdentityCard',
        steps: [
            {
                icon: 'IcIdCardFront',
                title: localize('Upload the front of your identity card'),
                description: localize('You’ll be asked to upload the back of your identity card next.'),
                confirm_description: localize(
                    'After confirming, you’ll be asked to upload the back of your identity card next.'
                ),
            },
            {
                icon: 'IcIdCardBack',
                title: localize('Upload the back of your identity card'),
            },
        ],
    },
    ...(residence === 'ng'
        ? [
              {
                  title: localize('NIMC slip and an age declaration document'),
                  description: localize('Upload both of these documents to prove your identity.'),
                  icon: 'IcPoiNimcSlip',
                  steps: [
                      {
                          icon: 'IcPoiNimcSlipHorizontal',
                          title: localize('Upload your NIMC slip'),
                          description: localize('You’ll be asked to upload your age declaration document next.'),
                          confirm_description: localize(
                              'After confirming, you’ll be asked to upload your age declaration document next.'
                          ),
                      },
                      {
                          icon: 'IcDop',
                          title: localize('Upload your age declaration document'),
                      },
                  ],
              },
          ]
        : []),
];
