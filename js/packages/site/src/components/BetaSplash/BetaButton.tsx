import React from "react";
import {
  StackDivider,
  Image,
  Box,
  Link,
  Text,
  Heading,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import DevMode from "../../../public/EnableDevMode.png";
import LoadUnpacked from "../../../public/LoadUnpacked.png";

export default ({ colorScheme = "indigo" }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Button colorScheme={colorScheme} onClick={onOpen}>
        Download the Beta
      </Button>

      <Modal size="3xl" isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Beta Extension Installation Guide</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack
              spacing={4}
              align="start"
              divider={<StackDivider borderColor="gray.200" />}
            >
              <Box>
                <Text>
                  We're still waiting on our app to be added to the chrome
                  webstore. In the meantime, you can install the extension
                  manually.
                </Text>
              </Box>
              <Box>
                <Heading size="md">Step 1. Download the zip file</Heading>
                <Text>
                  Download the extension&nbsp;
                  <Link
                    color="#0645AD"
                    href="https://wumbo-dist.s3.us-east-2.amazonaws.com/dist.zip"
                  >
                    here.
                  </Link>
                  &nbsp; Then, extract the <code>dist.zip</code> folder so its
                  contents are unzipped.
                </Text>
              </Box>
              <Box>
                <Heading size="md">
                  Step 2. Go to your Chrome Extensions Page
                </Heading>
                <Text>
                  On your Chrome browser, type to{" "}
                  <Link
                    color="#0645AD"
                    href="chrome://extensions"
                    target="_blank"
                  >
                    chrome://extensions
                  </Link>{" "}
                  in your address bar.
                </Text>
              </Box>
              <Box>
                <Heading size="md">Step 3. Enable Developer Mode</Heading>
                <Text>
                  Once on the Extensions page, make sure you enable the
                  Developer Mode switch.
                </Text>
                <Image src={DevMode} />
              </Box>
              <Box>
                <Heading size="md">
                  Step 4. Load the Unpacked dist Folder
                </Heading>
                <Text>
                  Click on “Load unpacked” on the top left of the page. This
                  will open your file browser. Navigate to the folder you just
                  unpacked (previously dist.zip). Click on that file and click
                  “Select.” This will install the extension to Chrome.
                </Text>
                <Image src={LoadUnpacked} />
              </Box>
              <Box>
                <Heading size="md">
                  Step 5. Give it a try and let us know your thoughts!
                </Heading>
                <Text>
                  Now, head to Twitter. All of the profiles should have Wum.bo
                  buttons and information added to them! We’d love to hear your
                  feedback! Please send us bug reports and feedback on&nbsp;
                  <Link
                    color="blue.500"
                    target="_blank"
                    rel="noreferrer"
                    href="https://discord.gg/S8wJBR2BQV"
                  >
                    Discord
                  </Link>
                  ! We can’t thank you enough for being a Beta Tester!
                </Text>
              </Box>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
