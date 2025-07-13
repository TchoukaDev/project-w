import { useFollowing } from "../hooks/users/useFollowing";
import { useToggleFollowing } from "../hooks/users/useToggleFollowing";
import Button from "./Button";

export default function FollowingButton({ currentUserId, followedUserId }) {
  const { data: isFollowing, isLoading } = useFollowing(
    currentUserId,
    followedUserId
  );
  const {
    mutate: toggleFollowing,
    isLoading: mutationLoading,
    error,
  } = useToggleFollowing(currentUserId, followedUserId);
  return (
    <Button
      value={isFollowing ? "Se désabonner" : "S'abonner"}
      disabled={mutationLoading || isLoading}
      onClick={() => toggleFollowing(isFollowing)}
    />
  );
}
