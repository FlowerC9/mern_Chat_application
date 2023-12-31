import React, { useState } from 'react';
import {
    Box, Button, Tooltip, Text,
    MenuButton, Menu, MenuList, Avatar,
    MenuItem, MenuDivider,
    Drawer,
    DrawerBody,
    DrawerFooter,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    useDisclosure,
    Input,
    useToast,
    Spinner
} from '@chakra-ui/react';
import { BellIcon, ChevronDownIcon } from '@chakra-ui/icons'
import { ChatState } from '../../context/chatProvider';
import ProfileModal from './ProfileModal'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ChatLoading from '../userAvater/ChatLoading';
import UserListItem from '../userAvater/UserListItem';
import { getSender } from '../../config/ChatLogic';
import NotificationBadge from './NotificationBadge';
import './notificationBadge.css';
import { baseurl } from '../baseurl'
const SideDrawer = () => {
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingChat, setLoadingChat] = useState();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { user, setSelectedChat, chats, setChats, notification, setNotification } = ChatState();
    const toast = useToast();
    const navigate = useNavigate();
    const logoutHandler = () => {
        localStorage.removeItem('userInfo');
        navigate('/');
    }
    const handleSearch = async () => {
        if (!search) {
            toast({
                title: "Please Enter Something in Search",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top-left",
            });
            return;
        }
        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                }
            }
            const { data } = await axios.get(
                `${baseurl}/api/user?search=${search}`
                , config
            );
            setLoading(false);
            setSearchResult(data);
        } catch (error) {
            toast({
                title: "Error Occured!",
                status: "Failed to Load the Search Results",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
            });
            return;
        }
    };
    const accessChat = async (userId) => {
        try {
            setLoading(true);
            const config = {
                headers: {
                    "Content-type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                }
            };
            const { data } = await axios.post(`${baseurl}/api/chat`,
                { userId }, config
            );
            if (!chats.find(c => c._id === data._id)) setChats([data, ...chats]);
            setSelectedChat(data);
            setLoadingChat(false);
            onClose();
        } catch (error) {
            toast({
                title: "Error fetching the chat",
                description: error.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
            });
        }
    }
    return (
        <>
            <Box
                display={'flex'}
                justifyContent={'space-between'}
                alignItems={'center'}
                bg={'white'}
                w={'100%'}
                p={'5px 10px 5px 10px'}
                borderWidth={'5px'}
            >
                <Tooltip
                    label="Search Users to Chat"
                    hasArrow
                    placement='bottom-end'
                >
                    <Button variant={'ghost'}
                        onClick={onOpen}
                    >
                        <i class="fa-brands fa-searchengin"></i>
                        <Text display={{ base: "none", md: "flex" }} px={'4'}>
                            Search User
                        </Text>
                    </Button>
                </Tooltip>
                <Text fontSize={'2xl'} fontFamily={'Work sans'}>
                    UiTalk
                </Text>
                <div>
                    <Menu>
                        <MenuButton p={1}>
                            <NotificationBadge count={notification.length} />
                            <BellIcon fontSize="2xl" m={1} />
                        </MenuButton>
                        <MenuList pl={2}>
                            {!notification.length && "No New Messages"}
                            {notification.map((notif) => (
                                <MenuItem
                                    key={notif._id}
                                    onClick={() => {
                                        setSelectedChat(notif.chat);
                                        setNotification(notification.filter((n) => n !== notif));
                                    }}
                                >
                                    {notif.chat.isGroupChat
                                        ? `New Message in ${notif.chat.chatName}`
                                        : `New Message from ${getSender(user, notif.chat.users)}`}
                                </MenuItem>
                            ))}
                        </MenuList>
                    </Menu>
                    <Menu>
                        <MenuButton as={Button}
                            rightIcon={<ChevronDownIcon />}
                        >
                            <Avatar size={'sm'}
                                cursor={'pointer'}
                                name={user.name}
                            />
                        </MenuButton>
                        <MenuList>
                            <ProfileModal user={user}>
                                <MenuItem>My Profile</MenuItem>
                            </ProfileModal>
                            <MenuDivider />
                            <MenuItem onClick={logoutHandler}>Log Out</MenuItem>
                        </MenuList>
                    </Menu>
                </div>
            </Box>
            <Drawer
                isOpen={isOpen}
                placement={'left'}
                onClose={onClose}
            >
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerHeader>Search User</DrawerHeader>

                    <DrawerBody>
                        <Box display={'flex'} pb={2}>
                            <Input
                                placeholder={'Search by name or email'}
                                mr={2}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <Button onClick={handleSearch}>
                                Go
                            </Button>
                        </Box>
                        {loading ? (
                            <ChatLoading />
                        ) : (
                            searchResult?.map((user) => (
                                <UserListItem
                                    key={user._id}
                                    user={user}
                                    handleFunction={() => accessChat(user._id)}
                                />
                            ))
                        )}
                        {loadingChat && <Spinner ml={'auto'} display={'flex'} />}
                    </DrawerBody>

                    <DrawerFooter>
                        <Button variant='outline' mr={3} onClick={onClose}>
                            Cancel
                        </Button>
                        <Button colorScheme='blue'>Save</Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </>
    )
}

export default SideDrawer