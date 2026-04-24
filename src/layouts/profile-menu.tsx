"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Title, Text, Avatar, Button, Popover } from "rizzui";
import cn from "@/utils/class-names";
import { routes } from "@/config/routes";
import { logoutUser } from "@/lib/auth/auth-client";

// Mock user data - replace with real user context when available
const MOCK_USER = {
  name: "Albert Flores",
  displayName: "Albert",
  email: "flores@doe.io",
  avatar: "https://isomorphic-furyroad.s3.amazonaws.com/public/avatars/avatar-11.webp",
};

const menuItems = [
  {
    name: "My Profile",
    href: routes.profile,
  },
  {
    name: "Account Settings",
    href: routes.forms.profileSettings,
  },
  {
    name: "Activity Log",
    href: "#",
  },
];

function DropdownMenu() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      setIsSubmitting(true);
      await logoutUser();
      toast.success("Signed out successfully.");
      router.push(routes.auth.signIn1);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to sign out right now."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-64 text-left rtl:text-right">
      <div className="flex items-center border-b border-gray-300 px-6 pb-5 pt-6">
        <Avatar
          src={MOCK_USER.avatar}
          name={MOCK_USER.name}
        />
        <div className="ms-3">
          <Title as="h6" className="font-semibold">
            {MOCK_USER.name}
          </Title>
          <Text className="text-gray-600">{MOCK_USER.email}</Text>
        </div>
      </div>
      <div className="grid px-3.5 py-3.5 font-medium text-gray-700">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="group my-0.5 flex items-center rounded-md px-2.5 py-2 hover:bg-gray-100 focus:outline-none hover:dark:bg-gray-50/50"
          >
            {item.name}
          </Link>
        ))}
      </div>
      <div className="border-t border-gray-300 px-6 pb-6 pt-5">
        <Button
          className="h-auto w-full justify-start p-0 font-medium text-gray-700 outline-none focus-within:text-gray-600 hover:text-gray-900 focus-visible:ring-0"
          variant="text"
          onClick={handleLogout}
          isLoading={isSubmitting}
          disabled={isSubmitting}
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
}

export default function ProfileMenu({
  buttonClassName,
  avatarClassName,
  username = false,
}: {
  buttonClassName?: string;
  avatarClassName?: string;
  username?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <Popover
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      shadow="sm"
      placement="bottom-end"
    >
      <Popover.Trigger>
        <button
          className={cn(
            "w-9 shrink-0 rounded-full outline-none focus-visible:ring-[1.5px] focus-visible:ring-gray-400 focus-visible:ring-offset-2 active:translate-y-px sm:w-10",
            buttonClassName,
          )}
        >
          <Avatar
            src={MOCK_USER.avatar}
            name={MOCK_USER.name}
            className={cn("!h-9 w-9 sm:!h-10 sm:!w-10", avatarClassName)}
          />
          {!!username && (
            <span className="username hidden text-gray-200 md:inline-flex dark:text-gray-700">
              Hi, {MOCK_USER.displayName}
            </span>
          )}
        </button>
      </Popover.Trigger>

      <Popover.Content className="z-[9999] p-0 dark:bg-gray-100 [&>svg]:dark:fill-gray-100">
        <DropdownMenu />
      </Popover.Content>
    </Popover>
  );
}
